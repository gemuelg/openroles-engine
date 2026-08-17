import {
  JobsResponse,
  JobDetailResponse,
  CompaniesResponse,
  CompanyDetailResponse,
  StatsResponse,
  JobQueryParams,
} from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * Helper to safely construct query strings without dropping valid 0 or boolean values
 */
function buildQueryString(params: JobQueryParams): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Generic API client with Next.js cache controls and error propagation
 */
async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultOptions: RequestInit = {
    next: { revalidate: 60 },
  };

  const res = await fetch(url, { ...defaultOptions, ...options });

  if (!res.ok) {
    throw new ApiError(`API Error [${res.status}]: ${res.statusText}`, res.status);
  }

  return res.json();
}

/**
 * Fetch paginated and filtered job listings
 */
export async function getJobs(
  params: JobQueryParams = {},
  options?: RequestInit
): Promise<JobsResponse> {
  return fetchAPI<JobsResponse>(`/jobs${buildQueryString(params)}`, options);
}

/**
 * Fetch single job details by slug or numerical ID
 */
export async function getJobBySlug(
  idOrSlug: string,
  options?: RequestInit
): Promise<JobDetailResponse> {
  return fetchAPI<JobDetailResponse>(`/jobs/${idOrSlug}`, options);
}

/**
 * Fetch active tracked companies
 */
export async function getCompanies(options?: RequestInit): Promise<CompaniesResponse> {
  return fetchAPI<CompaniesResponse>('/companies', options);
}

/**
 * Fetch engine statistics
 */
export async function getStats(options?: RequestInit): Promise<StatsResponse> {
  return fetchAPI<StatsResponse>('/stats', options);
}

/**
 * Fetch single company details with its active jobs by slug or UUID
 */
export async function getCompanyBySlug(
  idOrSlug: string,
  options?: RequestInit
): Promise<CompanyDetailResponse> {
  return fetchAPI<CompanyDetailResponse>(`/companies/${idOrSlug}`, options);
}