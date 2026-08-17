import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { db } from './db';

// Initialize the universal Hono application
export const app = new Hono();

// Enable CORS for frontend clients (e.g., http://localhost:3000)
app.use('*', cors());

// ============================================================================
// 1. HEALTH CHECK ENDPOINT
// ============================================================================
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// ============================================================================
// 2. SEARCH & FILTER JOBS ENDPOINT
// ============================================================================
// Route: GET /api/jobs?search=developer&department=Engineering&page=1
app.get('/api/jobs', async (c) => {
  try {
    const search = c.req.query('search');
    const category = c.req.query('category');
    const department = c.req.query('department');
    const workplace = c.req.query('workplace');
    const isRemote = c.req.query('is_remote');
    const minSalary = c.req.query('min_salary');
    const pageStr = c.req.query('page') || '1';
    const limitStr = c.req.query('limit') || '20';

    const page = Math.max(1, parseInt(pageStr, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(limitStr, 10) || 20));
    const offset = (page - 1) * limit;

    const conditions: string[] = ['j.is_active = TRUE'];
    const values: any[] = [];
    let paramIndex = 1;

    // Substring search on role title and company name
    if (search && search.trim() !== '') {
      conditions.push(`(j.title ILIKE $${paramIndex} OR c.name ILIKE $${paramIndex})`);
      values.push(`%${search.trim()}%`);
      paramIndex++;
    }

    // Filter by Company Category
    if (category && category.trim() !== '') {
      conditions.push(`c.category = $${paramIndex}`);
      values.push(category.trim());
      paramIndex++;
    }

    // Filter by Normalized Department
    if (department && department.trim() !== '') {
      conditions.push(`j.normalized_department = $${paramIndex}`);
      values.push(department.trim());
      paramIndex++;
    }

    // Filter by Workplace Classification
    if (workplace && workplace.trim() !== '') {
      conditions.push(`j.workplace_type = $${paramIndex}`);
      values.push(workplace.trim());
      paramIndex++;
    }

    // Filter by Remote Boolean Flag
    if (isRemote === 'true') {
      conditions.push('j.is_remote = TRUE');
    }

    // Filter by Minimum Base Salary
    if (minSalary && !isNaN(Number(minSalary))) {
      conditions.push(`j.max_salary >= $${paramIndex}`);
      values.push(Number(minSalary));
      paramIndex++;
    }

    const whereClause = `WHERE ${conditions.join(' AND ')}`;

    // Data Query SQL
    const dataValues = [...values, limit, offset];
    const limitParamIndex = paramIndex;
    const offsetParamIndex = paramIndex + 1;

    const sqlQuery = `
      SELECT 
        j.id,
        j.title,
        j.slug,
        j.apply_url,
        j.location_raw,
        j.is_remote,
        j.department,
        j.normalized_department,
        j.workplace_type,
        j.min_salary,
        j.max_salary,
        j.currency,
        j.salary_interval,
        j.published_at,
        c.name AS company_name,
        c.slug AS company_slug,
        c.category AS company_category,
        c.logo_url AS company_logo
      FROM jobs j
      JOIN companies c ON j.company_id = c.id
      ${whereClause}
      ORDER BY j.published_at DESC NULLS LAST, j.id DESC
      LIMIT $${limitParamIndex} OFFSET $${offsetParamIndex};
    `;

    // Count Query SQL (no ORDER BY required)
    const countQuery = `
      SELECT COUNT(*)::int AS total
      FROM jobs j
      JOIN companies c ON j.company_id = c.id
      ${whereClause};
    `;

    // Execute queries in parallel
    const [dataResult, countResult] = await Promise.all([
      db.query(sqlQuery, dataValues),
      db.query(countQuery, values),
    ]);

    const jobs = dataResult.rows;
    const totalJobs = countResult.rows[0]?.total || 0;
    const totalPages = Math.ceil(totalJobs / limit);

    return c.json({
      data: jobs,
      pagination: {
        total_jobs: totalJobs,
        total_pages: totalPages,
        current_page: page,
        per_page: limit,
        has_next_page: page <   totalPages,
        has_prev_page: page > 1,
      },
    });
  } catch (error: any) {
    console.error('API Error /api/jobs:', error);
    return c.json({ error: 'Internal Server Error', message: error.message }, 500);
  }
});

// ============================================================================
// 3. GET SINGLE JOB DETAILS (BY SLUG OR UUID)
// ============================================================================
app.get('/api/jobs/:idOrSlug', async (c) => {
  try {
    const idOrSlug = c.req.param('idOrSlug');
    // Regex matching standard UUID format
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

    const query = `
      SELECT 
        j.*,
        c.name AS company_name,
        c.slug AS company_slug,
        c.category AS company_category,
        c.website_url AS company_website,
        c.logo_url AS company_logo
      FROM jobs j
      JOIN companies c ON j.company_id = c.id
      WHERE ${isUuid ? 'j.id = $1::uuid' : 'j.slug = $1'} AND j.is_active = TRUE;
    `;

    const result = await db.query(query, [idOrSlug]);

    if (result.rows.length === 0) {
      return c.json({ error: 'Not Found', message: 'Job listing not found.' }, 404);
    }

    return c.json({ data: result.rows[0] });
  } catch (error: any) {
    console.error('API Error /api/jobs/:idOrSlug:', error);
    return c.json({ error: 'Internal Server Error', message: error.message }, 500);
  }
});
// ============================================================================
// 4. GET ALL ACTIVE COMPANIES
// ============================================================================
// Route: GET /api/companies
app.get('/api/companies', async (c) => {
  try {
    const query = `
      SELECT 
        c.id,
        c.name,
        c.slug,
        c.category,
        c.logo_url,
        c.website_url,
        COUNT(j.id)::int AS active_job_count
      FROM companies c
      LEFT JOIN jobs j ON c.id = j.company_id AND j.is_active = TRUE
      WHERE c.is_active = TRUE
      GROUP BY c.id
      ORDER BY active_job_count DESC, c.name ASC;
    `;

    const result = await db.query(query);
    return c.json({ data: result.rows });
  } catch (error: any) {
    console.error('API Error /api/companies:', error);
    return c.json({ error: 'Internal Server Error', message: error.message }, 500);
  }
});

// ============================================================================
// 4b. GET SINGLE COMPANY DETAILS WITH ACTIVE ROLES
// ============================================================================
// Route: GET /api/companies/:idOrSlug
app.get('/api/companies/:idOrSlug', async (c) => {
  try {
    const idOrSlug = c.req.param('idOrSlug');
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);

    const companyQuery = `
      SELECT id, name, slug, category, website_url, logo_url
      FROM companies
      WHERE ${isUuid ? 'id = $1::uuid' : 'slug = $1'} AND is_active = TRUE;
    `;

    const companyResult = await db.query(companyQuery, [idOrSlug]);

    if (companyResult.rows.length === 0) {
      return c.json({ error: 'Not Found', message: 'Company not found.' }, 404);
    }

    const company = companyResult.rows[0];

    const jobsQuery = `
      SELECT 
        id, title, slug, location_raw, is_remote, 
        normalized_department, workplace_type, min_salary, 
        max_salary, currency, published_at
      FROM jobs
      WHERE company_id = $1 AND is_active = TRUE
      ORDER BY published_at DESC NULLS LAST;
    `;

    const jobsResult = await db.query(jobsQuery, [company.id]);

    return c.json({
      data: {
        ...company,
        jobs: jobsResult.rows,
      },
    });
  } catch (error: any) {
    console.error('API Error /api/companies/:idOrSlug:', error);
    return c.json({ error: 'Internal Server Error', message: error.message }, 500);
  }
});

// ============================================================================
// 5. METRICS & STATS ENDPOINT
// ============================================================================
// Route: GET /api/stats
app.get('/api/stats', async (c) => {
  try {
    const statsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM jobs WHERE is_active = TRUE)::int AS total_active_jobs,
        (SELECT COUNT(*) FROM companies WHERE is_active = TRUE)::int AS total_active_companies,
        (SELECT COUNT(*) FROM jobs WHERE is_active = TRUE AND is_remote = TRUE)::int AS total_remote_jobs,
        (SELECT COUNT(*) FROM jobs WHERE is_active = TRUE AND min_salary IS NOT NULL)::int AS jobs_with_salary;
    `;

    const result = await db.query(statsQuery);
    return c.json({ data: result.rows[0] });
  } catch (error: any) {
    console.error('API Error /api/stats:', error);
    return c.json({ error: 'Internal Server Error', message: error.message }, 500);
  }
});