import {
  JobsResponse,
  JobDetailResponse,
  CompaniesResponse,
  StatsResponse,
  JobQueryParams,
} from '../types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

/**
 * Helper to turn query parameter object into URLSearchParams string
 */
function buildQueryString(params: JobQueryParams): string {
  const searchParams = new URLSearchParams();

  if (params.search) searchParams.set('search', params.search);
  if (params.category) searchParams.set('category', params.category);
  if (params.department) searchParams.set('department', params.department);
  if (params.workplace) searchParams.set('workplace', params.workplace);
  if (params.is_remote) searchParams.set('is_remote', 'true');
  if (params.min_salary) searchParams.set('min_salary', params.min_salary.toString());
  if (params.page) searchParams.set('page', params.page.toString());
  if (params.limit) searchParams.set('limit', params.limit.toString());

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Fetch paginated and filtered job listings
 */
export async function getJobs(params: JobQueryParams = {}): Promise<JobsResponse> {
  const url = `${API_BASE_URL}/jobs${buildQueryString(params)}`;
  const res = await fetch(url, { cache: 'no-store' });

  if (!res.ok) {
    throw new Error(`Failed to fetch jobs: ${res.statusText}`);
  }

  return res.json();
}

/**
 * Fetch single job details by slug or numerical ID
 */
export async function getJobBySlug(idOrSlug: string): Promise<JobDetailResponse> {
  const res = await fetch(`${API_BASE_URL}/jobs/${idOrSlug}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch job detail for: ${idOrSlug}`);
  }

  return res.json();
}

/**
 * Fetch active tracked companies
 */
export async function getCompanies(): Promise<CompaniesResponse> {
  const res = await fetch(`${API_BASE_URL}/companies`, { cache: 'no-store' });

  if (!res.ok) {
    throw new Error(`Failed to fetch companies: ${res.statusText}`);
  }

  return res.json();
}

/**
 * Fetch engine statistics
 */
export async function getStats(): Promise<StatsResponse> {
  const res = await fetch(`${API_BASE_URL}/stats`, { cache: 'no-store' });

  if (!res.ok) {
    throw new Error(`Failed to fetch stats: ${res.statusText}`);
  }

  return res.json();
}