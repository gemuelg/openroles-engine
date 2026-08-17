export interface Job {
  id: string;
  title: string;
  slug: string;
  apply_url: string;
  location_raw: string | null;
  is_remote: boolean;
  department: string | null;
  normalized_department: string | null;
  workplace_type: string | null;
  min_salary: number | null;
  max_salary: number | null;
  currency: string | null;
  salary_interval: string | null;
  published_at: string | null;
  company_name: string;
  company_slug: string;
  company_category: string | null;
  company_logo: string | null;
  company_website?: string | null;
  description_html?: string | null;
}

export interface Company {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  logo_url: string | null;
  website_url: string | null;
  active_job_count: number;
}

export interface CompanyDetail extends Company {
  jobs?: Job[];
}

export interface CompanyDetailResponse {
  data: CompanyDetail;
}

export interface Pagination {
  total_jobs: number;
  total_pages: number;
  current_page: number;
  per_page: number;
  has_next_page: boolean;
  has_prev_page: boolean;
}

export interface JobsResponse {
  data: Job[];
  pagination: Pagination;
}

export interface JobDetailResponse {
  data: Job;
}

export interface CompaniesResponse {
  data: Company[];
}

export interface Stats {
  total_active_jobs: number;
  total_active_companies: number;
  total_remote_jobs: number;
  jobs_with_salary: number;
}

export interface StatsResponse {
  data: Stats;
}

export interface JobQueryParams {
  search?: string;
  category?: string;
  department?: string;
  workplace?: string;
  is_remote?: boolean;
  min_salary?: number;
  page?: number;
  limit?: number;
}