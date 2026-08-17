'use client';

import { useState, useEffect, useCallback } from 'react';

interface Job {
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
  published_at: string | null;
  company_name: string;
  company_slug: string;
  company_category: string | null;
  company_logo: string | null;
}

interface Pagination {
  total_jobs: number;
  total_pages: number;
  current_page: number;
  per_page: number;
  has_next_page: boolean;
  has_prev_page: boolean;
}

const DEPARTMENTS = [
  'All Departments',
  'Engineering',
  'Product',
  'Design',
  'Data & AI',
  'Operations',
];

export default function JobFeed() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [isRemoteOnly, setIsRemoteOnly] = useState(false);
  const [page, setPage] = useState(1);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (selectedDept && selectedDept !== 'All Departments') {
        params.append('department', selectedDept);
      }
      if (isRemoteOnly) params.append('is_remote', 'true');
      params.append('page', page.toString());
      params.append('limit', '15');

      const res = await fetch(`http://localhost:3001/api/jobs?${params.toString()}`);
      const json = await res.json();

      if (res.ok) {
        setJobs(json.data || []);
        setPagination(json.pagination || null);
      } else {
        console.error('API Error:', json.message);
      }
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setLoading(false);
    }
  }, [search, selectedDept, isRemoteOnly, page]);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchJobs();
    }, 250);

    return () => clearTimeout(handler);
  }, [fetchJobs]);

  const formatSalary = (min: number | null, max: number | null, curr: string | null) => {
    if (!min && !max) return null;
    const currencySymbol = curr === 'EUR' ? '€' : '$';
    if (min && max) return `${currencySymbol}${(min / 1000).toFixed(0)}k - ${currencySymbol}${(max / 1000).toFixed(0)}k`;
    if (max) return `Up to ${currencySymbol}${(max / 1000).toFixed(0)}k`;
    if (min) return `From ${currencySymbol}${(min / 1000).toFixed(0)}k`;
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-4 rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search roles or companies..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:border-neutral-600 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedDept}
            onChange={(e) => {
              setSelectedDept(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2.5 text-sm text-neutral-300 focus:border-neutral-600 focus:outline-none"
          >
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept === 'All Departments' ? '' : dept}>
                {dept}
              </option>
            ))}
          </select>

          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-300">
            <input
              type="checkbox"
              checked={isRemoteOnly}
              onChange={(e) => {
                setIsRemoteOnly(e.target.checked);
                setPage(1);
              }}
              className="h-4 w-4 rounded border-neutral-700 bg-neutral-900 accent-white"
            />
            <span>Remote Only</span>
          </label>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs font-mono tracking-wider text-neutral-500 uppercase">
        <span>
          {pagination ? `${pagination.total_jobs} Active Openings` : 'Loading positions...'}
        </span>
        {pagination && <span>Page {pagination.current_page} of {pagination.total_pages || 1}</span>}
      </div>

      {/* Job Cards Stream */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl border border-neutral-800 bg-neutral-900/40" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-800 py-16 text-center">
          <p className="text-neutral-400">No open positions matching your filter criteria.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => {
            const salaryText = formatSalary(job.min_salary, job.max_salary, job.currency);
            return (
              <div
                key={job.id}
                className="group flex flex-col justify-between gap-4 rounded-xl border border-neutral-800/80 bg-neutral-900/40 p-5 transition hover:border-neutral-700 hover:bg-neutral-900/80 sm:flex-row sm:items-center"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-neutral-400">{job.company_name}</span>
                    {job.company_category && (
                      <span className="rounded bg-neutral-800 px-1.5 py-0.5 text-[10px] text-neutral-400">
                        {job.company_category}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-semibold text-white group-hover:text-neutral-200">
                    {job.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-500">
                    {job.location_raw && <span>{job.location_raw}</span>}
                    {job.is_remote && (
                      <span className="rounded-full bg-emerald-950/60 px-2 py-0.5 font-mono text-emerald-400 border border-emerald-800/50">
                        Remote
                      </span>
                    )}
                    {salaryText && <span className="font-mono text-neutral-300">{salaryText}</span>}
                  </div>
                </div>

                <a
                  href={job.apply_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 text-xs font-semibold text-white transition hover:border-neutral-500 hover:bg-neutral-700 sm:w-auto"
                >
                  Apply Role
                </a>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Bar */}
      {pagination && pagination.total_pages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <button
            disabled={!pagination.has_prev_page}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2 text-xs font-semibold text-white transition hover:border-neutral-600 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-xs font-mono text-neutral-500">
            {pagination.current_page} / {pagination.total_pages}
          </span>
          <button
            disabled={!pagination.has_next_page}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-2 text-xs font-semibold text-white transition hover:border-neutral-600 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}