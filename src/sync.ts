import { fileURLToPath } from 'url';
import path from 'path';
import { db } from './db';
import { GreenhouseImporter, NormalizedJob } from './importers/greenhouse';
import { LeverImporter } from './importers/lever';
import { AshbyImporter } from './importers/ashby';
import { WorkableImporter } from './importers/workable';

const greenhouseImporter = new GreenhouseImporter();
const leverImporter = new LeverImporter();
const ashbyImporter = new AshbyImporter();
const workableImporter = new WorkableImporter();

export async function runIngestionPipeline(): Promise<void> {
  console.log('[1/2] Fetching active target companies from database...');

  const companiesRes = await db.query(
    `SELECT id, name, ats_provider, ats_board_token 
     FROM companies 
     WHERE is_active = TRUE;`
  );

  const companies = companiesRes.rows;
  console.log(`Found ${companies.length} active target companies to sync.`);

  let totalJobsProcessed = 0;
  let totalJobsDeactivated = 0;

  for (const company of companies) {
    console.log(`\nSyncing ${company.name} via ${company.ats_provider.toUpperCase()} (${company.ats_board_token})...`);

    try {
      let fetchedJobs: NormalizedJob[] = [];

      // 1. Fetch jobs from the respective ATS Provider
      if (company.ats_provider === 'greenhouse') {
        fetchedJobs = await greenhouseImporter.fetchJobs(company.ats_board_token, company.name);
      } else if (company.ats_provider === 'lever') {
        fetchedJobs = await leverImporter.fetchJobs(company.ats_board_token, company.name);
      } else if (company.ats_provider === 'ashby') {
        fetchedJobs = await ashbyImporter.fetchJobs(company.ats_board_token, company.name);
      } else if (company.ats_provider === 'workable') {
        fetchedJobs = await workableImporter.fetchJobs(company.ats_board_token, company.name);
      }

      console.log(`-> Retrieved ${fetchedJobs.length} live jobs from feed.`);

      const activeSourceJobIds: string[] = [];

      // 2. Upsert fetched active jobs into PostgreSQL
      for (const job of fetchedJobs) {
        activeSourceJobIds.push(job.sourceJobId);

        // Ensure slug uniqueness safety to avoid SQL 'jobs_slug_key' unique constraint violations
        const safeSlug = `${job.slug}-${job.sourceJobId.slice(-6).toLowerCase()}`;

        const upsertQuery = `
          INSERT INTO jobs (
            company_id, source_job_id, title, slug, apply_url, 
            location_raw, is_remote, department, 
            description_html, content_hash, published_at, is_active
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, TRUE)
          ON CONFLICT (company_id, source_job_id) 
          DO UPDATE SET
            title = EXCLUDED.title,
            slug = EXCLUDED.slug,
            apply_url = EXCLUDED.apply_url,
            location_raw = EXCLUDED.location_raw,
            is_remote = EXCLUDED.is_remote,
            department = EXCLUDED.department,
            description_html = EXCLUDED.description_html,
            content_hash = EXCLUDED.content_hash,
            published_at = EXCLUDED.published_at,
            is_active = TRUE,
            updated_at = CURRENT_TIMESTAMP
          WHERE jobs.content_hash <> EXCLUDED.content_hash OR jobs.is_active = FALSE;
        `;

        await db.query(upsertQuery, [
          company.id,
          job.sourceJobId,
          job.title,
          safeSlug,
          job.applyUrl,
          job.locationRaw,
          job.isRemote,
          job.department,
          job.descriptionHtml,
          job.contentHash,
          job.publishedAt,
        ]);
      }

      // 3. Mark removed/closed jobs as inactive
      if (activeSourceJobIds.length > 0) {
        const deactivateRes = await db.query(
          `UPDATE jobs 
           SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP 
           WHERE company_id = $1 
             AND is_active = TRUE 
             AND NOT (source_job_id = ANY($2::text[]));`,
          [company.id, activeSourceJobIds]
        );

        if (deactivateRes.rowCount && deactivateRes.rowCount > 0) {
          console.log(`-> Deactivated ${deactivateRes.rowCount} closed/removed roles.`);
          totalJobsDeactivated += deactivateRes.rowCount;
        }
      } else {
        // If 0 jobs were returned by ATS, soft-deactivate all previously open jobs
        const deactivateAllRes = await db.query(
          `UPDATE jobs 
           SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP 
           WHERE company_id = $1 AND is_active = TRUE;`,
          [company.id]
        );
        totalJobsDeactivated += deactivateAllRes.rowCount || 0;
      }

      totalJobsProcessed += fetchedJobs.length;
    } catch (error: any) {
      console.warn(`⚠️ Warning: Failed sync for ${company.name} (${error.message})`);

      // Deactivate target company if board token endpoint returns 404
      if (error.message?.includes('Not Found') || error.status === 404) {
        await db.query(`UPDATE companies SET is_active = FALSE WHERE id = $1;`, [company.id]);
        console.log(`-> Deactivated company ID ${company.id} due to 404 endpoint response.`);
      }
    }
  }

  console.log(`\n====================================`);
  console.log(`Sync Completed!`);
  console.log(`- Total Live Jobs Upserted: ${totalJobsProcessed}`);
  console.log(`- Total Closed Roles Deactivated: ${totalJobsDeactivated}`);
  console.log(`====================================\n`);
}

// Execute directly if run as CLI script via `npm run sync`
const isMainScript = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMainScript) {
  runIngestionPipeline()
    .then(async () => {
      await db.end();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('Fatal sync process error:', err);
      await db.end();
      process.exit(1);
    });
}