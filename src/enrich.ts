import { fileURLToPath } from 'url';
import path from 'path';
import { db } from './db';

export interface RawJobData {
  id: string;
  title: string;
  location_raw: string | null;
  is_remote: boolean;
  department: string | null;
  description_html: string | null;
}

export interface EnrichedFields {
  minSalary: number | null;
  maxSalary: number | null;
  currency: string | null;
  salaryInterval: 'YEARLY' | 'HOURLY' | null;
  normalizedDepartment: string;
  workplaceType: 'REMOTE_US' | 'REMOTE_GLOBAL' | 'REMOTE_REGIONAL' | 'HYBRID' | 'ON_SITE';
}

export class JobEnricher {
  /**
   * Standardizes fragmented ATS departments into clean taxonomy buckets.
   */
  static normalizeDepartment(departmentRaw: string | null, title: string): string {
    const text = `${departmentRaw || ''} ${title}`.toLowerCase();

    if (/\b(engineer|engineering|software|developer|frontend|backend|fullstack|devops|infrastructure|platform|sre|qa|qa\/qc)\b/.test(text)) {
      return 'Engineering';
    }
    if (/\b(ai|ml|machine learning|data science|data engineer|analytics|algorithm)\b/.test(text)) {
      return 'Data & AI';
    }
    if (/\b(design|ui|ux|product design|brand|creative|graphic|animator)\b/.test(text)) {
      return 'Design & Creative';
    }
    if (/\b(product manager|product management|pm|technical product manager)\b/.test(text)) {
      return 'Product Management';
    }
    if (/\b(sales|account executive|business development|bd|gtm|growth|account manager)\b/.test(text)) {
      return 'Sales & GTM';
    }
    if (/\b(marketing|content|seo|copywriter|social media|brand marketing)\b/.test(text)) {
      return 'Marketing';
    }
    if (/\b(virtual assistant|executive assistant|va|administrative|admin|operations|customer support|support|bpo)\b/.test(text)) {
      return 'Operations & Support';
    }
    if (/\b(hr|people|recruiter|talent|talent acquisition)\b/.test(text)) {
      return 'People & HR';
    }
    if (/\b(finance|accounting|payroll|legal|compliance|counsel)\b/.test(text)) {
      return 'Finance & Legal';
    }

    return 'General / Other';
  }

  /**
   * Classifies remote work policy and geographical restrictions.
   */
  static categorizeWorkplace(locationRaw: string | null, isRemote: boolean, title: string): EnrichedFields['workplaceType'] {
    const loc = (locationRaw || '').toLowerCase();
    const t = title.toLowerCase();

    if (loc.includes('hybrid') || t.includes('hybrid')) {
      return 'HYBRID';
    }

    if (!isRemote && !loc.includes('remote')) {
      return 'ON_SITE';
    }

    // Remote region breakdown
    if (/\b(worldwide|anywhere|global|100% remote|remote - global|remote \(global\))\b/.test(loc)) {
      return 'REMOTE_GLOBAL';
    }
    if (/\b(us|usa|united states|us only|us-remote|remote - us|north america)\b/.test(loc)) {
      return 'REMOTE_US';
    }
    if (/\b(latam|emea|apac|europe|canada|uk|philippines|asia)\b/.test(loc)) {
      return 'REMOTE_REGIONAL';
    }

    return isRemote ? 'REMOTE_GLOBAL' : 'ON_SITE';
  }

  /**
   * Extracts currency, range, and pay intervals (Yearly vs Hourly) from plain text/HTML.
   */
  static extractSalary(htmlContent: string | null, title: string): {
    minSalary: number | null;
    maxSalary: number | null;
    currency: string | null;
    salaryInterval: 'YEARLY' | 'HOURLY' | null;
  } {
    if (!htmlContent && !title) {
      return { minSalary: null, maxSalary: null, currency: null, salaryInterval: null };
    }

    // Strip HTML tags for clean text extraction
    const plainText = `${title} ${(htmlContent || '').replace(/<[^>]*>/g, ' ')}`;

    // Detect currency symbol
    let currency: string | null = null;
    if (/\$|usd/i.test(plainText)) currency = 'USD';
    else if (/€|eur/i.test(plainText)) currency = 'EUR';
    else if (/£|gbp/i.test(plainText)) currency = 'GBP';
    else if (/c\$|cad/i.test(plainText)) currency = 'CAD';

    // Detect interval
    const isHourly = /\b(per hour|\/hr|\/hour|hourly)\b/i.test(plainText);
    const salaryInterval: 'YEARLY' | 'HOURLY' = isHourly ? 'HOURLY' : 'YEARLY';

    // Flexible Range Regex: captures formatted ($120,000), unformatted (120000), and short-hand ($120k)
    const rangeRegex = /(?:[\$€£]|CAD|USD)?\s*(\d{1,3}(?:,\d{3})+|\d{2,6})\s*(k)?\s*(?:-|to|–)\s*(?:[\$€£]|CAD|USD)?\s*(\d{1,3}(?:,\d{3})+|\d{2,6})\s*(k)?/i;
    const rangeMatch = plainText.match(rangeRegex);

    if (rangeMatch) {
      let min = parseFloat(rangeMatch[1].replace(/,/g, ''));
      let max = parseFloat(rangeMatch[3].replace(/,/g, ''));

      // Apply 1000 multiplier for 'k' notation or shorthand numbers under 1000 in yearly contexts
      if (rangeMatch[2]?.toLowerCase() === 'k' || (!isHourly && min < 1000)) min *= 1000;
      if (rangeMatch[4]?.toLowerCase() === 'k' || (!isHourly && max < 1000)) max *= 1000;

      // Validate bound sanity
      if (isHourly && min < 500 && max < 500 && min <= max) {
        return { minSalary: min, maxSalary: max, currency: currency || 'USD', salaryInterval: 'HOURLY' };
      }
      if (!isHourly && min >= 10000 && max <= 2000000 && min <= max) {
        return { minSalary: min, maxSalary: max, currency: currency || 'USD', salaryInterval: 'YEARLY' };
      }
    }

    return { minSalary: null, maxSalary: null, currency: null, salaryInterval: null };
  }

  /**
   * Main parsing transformer
   */
  static process(job: RawJobData): EnrichedFields {
    const salary = this.extractSalary(job.description_html, job.title);
    const normalizedDepartment = this.normalizeDepartment(job.department, job.title);
    const workplaceType = this.categorizeWorkplace(job.location_raw, job.is_remote, job.title);

    return {
      ...salary,
      normalizedDepartment,
      workplaceType,
    };
  }
}

export async function runEnrichmentPipeline(): Promise<void> {
  console.log('[Phase 3] Starting job enrichment process...');

  const jobsRes = await db.query(
    `SELECT id, title, location_raw, is_remote, department, description_html 
     FROM jobs 
     WHERE is_active = TRUE;`
  );

  const jobs: RawJobData[] = jobsRes.rows;
  console.log(`Analyzing ${jobs.length} active jobs for metadata enrichment...`);

  let enrichedCount = 0;
  let salaryCount = 0;

  for (const job of jobs) {
    const enriched = JobEnricher.process(job);

    await db.query(
      `UPDATE jobs 
       SET min_salary = $1,
           max_salary = $2,
           currency = $3,
           salary_interval = $4,
           normalized_department = $5,
           workplace_type = $6,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7;`,
      [
        enriched.minSalary,
        enriched.maxSalary,
        enriched.currency,
        enriched.salaryInterval,
        enriched.normalizedDepartment,
        enriched.workplaceType,
        job.id,
      ]
    );

    enrichedCount++;
    if (enriched.minSalary !== null) salaryCount++;
  }

  console.log('\n====================================');
  console.log(`Enrichment Complete!`);
  console.log(`- Jobs Enriched: ${enrichedCount}`);
  console.log(`- Salary Ranges Extracted: ${salaryCount}`);
  console.log('====================================\n');
}

// Execute enrichment if run directly as CLI command (`npm run enrich`)
const isMainScript = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMainScript) {
  runEnrichmentPipeline()
    .then(async () => {
      await db.end();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('Fatal enrichment process error:', err);
      await db.end();
      process.exit(1);
    });
}