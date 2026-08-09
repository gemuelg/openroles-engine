'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getJobs } from '../lib/api';
import { Job, Pagination, JobQueryParams } from '../types/api';

interface UseJobsReturn {
  jobs: Job[];
  pagination: Pagination | null;
  loading: boolean;
  error: string | null;
  filters: JobQueryParams;
  setSearch: (term: string) => void;
  setFilter: (key: keyof JobQueryParams, value: any) => void;
  resetFilters: () => void;
  setPage: (page: number) => void;
}

export function useJobs(initialLimit = 20): UseJobsReturn {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 1. Initialize state directly from URL query parameters
  const [filters, setFilters] = useState<JobQueryParams>(() => ({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    department: searchParams.get('department') || '',
    workplace: searchParams.get('workplace') || '',
    is_remote: searchParams.get('is_remote') === 'true',
    min_salary: searchParams.get('min_salary') ? Number(searchParams.get('min_salary')) : undefined,
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
    limit: initialLimit,
  }));

  const [debouncedSearch, setDebouncedSearch] = useState<string>(filters.search || '');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 2. Debounce search input changes (300ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search || '');
    }, 300);

    return () => clearTimeout(timer);
  }, [filters.search]);

  // 3. Sync filter updates back into browser URL
  const updateUrlParams = useCallback(
    (newFilters: JobQueryParams) => {
      const params = new URLSearchParams();

      if (newFilters.search) params.set('search', newFilters.search);
      if (newFilters.category) params.set('category', newFilters.category);
      if (newFilters.department) params.set('department', newFilters.department);
      if (newFilters.workplace) params.set('workplace', newFilters.workplace);
      if (newFilters.is_remote) params.set('is_remote', 'true');
      if (newFilters.min_salary) params.set('min_salary', newFilters.min_salary.toString());
      if (newFilters.page && newFilters.page > 1) params.set('page', newFilters.page.toString());

      const queryString = params.toString();
      const newUrl = queryString ? `?${queryString}` : window.location.pathname;

      router.push(newUrl, { scroll: false });
    },
    [router]
  );

  // 4. Fetch jobs whenever filters or debounced search changes
  useEffect(() => {
    let isMounted = true;

    async function fetchJobsData() {
      setLoading(true);
      setError(null);

      try {
        const queryParams: JobQueryParams = {
          ...filters,
          search: debouncedSearch,
        };

        const response = await getJobs(queryParams);

        if (isMounted) {
          setJobs(response.data);
          setPagination(response.pagination);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Failed to load job listings');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchJobsData();

    return () => {
      isMounted = false;
    };
  }, [
    debouncedSearch,
    filters.category,
    filters.department,
    filters.workplace,
    filters.is_remote,
    filters.min_salary,
    filters.page,
    filters.limit,
  ]);

  // Helper setter functions
  const setSearch = (term: string) => {
    const updated = { ...filters, search: term, page: 1 };
    setFilters(updated);
    updateUrlParams(updated);
  };

  const setFilter = (key: keyof JobQueryParams, value: any) => {
    const updated = { ...filters, [key]: value, page: 1 };
    setFilters(updated);
    updateUrlParams(updated);
  };

  const setPage = (page: number) => {
    const updated = { ...filters, page };
    setFilters(updated);
    updateUrlParams(updated);
  };

  const resetFilters = () => {
    const cleared: JobQueryParams = { page: 1, limit: initialLimit, search: '' };
    setFilters(cleared);
    setDebouncedSearch('');
    updateUrlParams(cleared);
  };

  return {
    jobs,
    pagination,
    loading,
    error,
    filters,
    setSearch,
    setFilter,
    resetFilters,
    setPage,
  };
}