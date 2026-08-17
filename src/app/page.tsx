'use client';

import { useState, useEffect } from 'react';

interface Job {
  id: string;
  title: string;
  slug: string;
  company_name: string;
  company_logo?: string;
  location_raw: string;
  is_remote: boolean;
  normalized_department: string;
  workplace_type: string;
  min_salary: number | null;
  max_salary: number | null;
  currency: string | null;
  description_html?: string;
  apply_url: string;
  published_at: string;
}

export default function JobBoardPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total_jobs: 0, total_pages: 1 });

  const departments = ['ALL', 'Engineering', 'Data & AI', 'Design & Creative', 'Product Management', 'Sales & GTM'];

  // Fetch Feed List
  const loadJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '30',
        ...(search && { search }),
        ...(selectedDept !== 'ALL' && { department: selectedDept }),
      });

      const res = await fetch(`http://localhost:4000/api/jobs?${params}`);
      const json = await res.json();
      const list = json.data || [];
      setJobs(list);
      setMeta({
        total_jobs: json.meta?.total_jobs || 0,
        total_pages: json.meta?.total_pages || 1,
      });

      // Auto-select first job if none is currently selected
      if (list.length > 0 && (!selectedJob || !list.some((j: Job) => j.id === selectedJob.id))) {
        fetchDetail(list[0].slug);
      }
    } catch (err) {
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Full Description for Right Pane
  const fetchDetail = async (slug: string) => {
    try {
      const res = await fetch(`http://localhost:4000/api/jobs/${slug}`);
      const json = await res.json();
      if (json.data) {
        setSelectedJob(json.data);
      }
    } catch (err) {
      console.error('Failed to load detail:', err);
    }
  };

  useEffect(() => {
    loadJobs();
  }, [page, selectedDept]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadJobs();
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Top Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <span className="text-xl font-black text-blue-700 tracking-tight">
              INDEX<span className="text-gray-900 font-light ml-1">JOBS</span>
            </span>
            <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-200">
              {meta.total_jobs.toLocaleString()} Active Listings Live
            </span>
          </div>
        </div>

        {/* Search Bar Strip */}
        <div className="bg-white border-t border-gray-100 py-3 px-6">
          <div className="max-w-7xl mx-auto">
            <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-2 bg-white border border-gray-300 rounded-xl p-1.5 shadow-2xs">
              <input
                type="text"
                placeholder="Job title, keywords, or company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 text-sm focus:outline-none bg-transparent"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-2.5 rounded-lg text-sm transition shadow-sm"
              >
                Search Jobs
              </button>
            </form>
          </div>
        </div>

        {/* Filter Pill Navigation */}
        <div className="bg-white border-t border-gray-200 px-6 py-2.5 overflow-x-auto">
          <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs font-semibold">
            <span className="text-gray-400 uppercase tracking-wider mr-2">Department:</span>
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => {
                  setSelectedDept(dept);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-full transition whitespace-nowrap ${
                  selectedDept === dept
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Split Layout */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Feed List (5 Cols) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex justify-between items-center text-xs text-gray-500 font-semibold px-1">
              <span>FEED RESULTS</span>
              <span>PAGE {page} OF {meta.total_pages}</span>
            </div>

            {loading ? (
              <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-400 text-sm">
                Loading database records...
              </div>
            ) : jobs.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-400 text-sm">
                No matching positions found.
              </div>
            ) : (
              <div className="space-y-3">
                {jobs.map((job) => {
                  const active = selectedJob?.id === job.id;
                  return (
                    <div
                      key={job.id}
                      onClick={() => fetchDetail(job.slug)}
                      className={`bg-white border rounded-xl p-4 cursor-pointer transition-all ${
                        active
                          ? 'border-blue-600 ring-2 ring-blue-600/10 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-2xs'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div>
                          <h3 className="font-bold text-gray-900 text-base leading-snug">{job.title}</h3>
                          <p className="text-sm font-medium text-gray-600 mt-0.5">{job.company_name}</p>
                          <p className="text-xs text-gray-400 mt-1">{job.location_raw || 'Global / Remote'}</p>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1.5 items-center">
                        {job.min_salary ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-xs font-semibold">
                            ${(job.min_salary / 1000).toFixed(0)}k{job.max_salary ? ` - $${(job.max_salary / 1000).toFixed(0)}k` : ''}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-xs">Competitive</span>
                        )}
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-medium">
                          {job.normalized_department}
                        </span>
                        {job.is_remote && (
                          <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 text-xs font-medium">
                            Remote
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            <div className="flex justify-between items-center bg-white border border-gray-200 rounded-xl p-3">
              <button
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-4 py-1.5 border rounded-lg text-xs font-semibold disabled:opacity-30 hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="text-xs text-gray-600">Page {page} / {meta.total_pages}</span>
              <button
                disabled={page >= meta.total_pages || loading}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-1.5 border rounded-lg text-xs font-semibold disabled:opacity-30 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>

          {/* Right Sticky Preview Pane (7 Cols) */}
          <div className="lg:col-span-7 sticky top-24">
            {selectedJob ? (
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200 bg-gray-50 flex justify-between items-start gap-4">
                  <div>
                    <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">{selectedJob.company_name}</span>
                    <h1 className="text-2xl font-bold text-gray-900 mt-1">{selectedJob.title}</h1>
                    <p className="text-sm text-gray-600 mt-1">{selectedJob.location_raw || 'Remote'}</p>
                  </div>
                  <a
                    href={selectedJob.apply_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition shrink-0 shadow-sm"
                  >
                    Apply Now
                  </a>
                </div>

                <div className="grid grid-cols-3 gap-4 p-6 bg-white border-b border-gray-100 text-xs">
                  <div>
                    <span className="text-gray-400 block uppercase font-medium">Department</span>
                    <span className="font-semibold text-gray-800 mt-0.5 block">{selectedJob.normalized_department}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block uppercase font-medium">Workplace</span>
                    <span className="font-semibold text-gray-800 mt-0.5 block">{selectedJob.workplace_type}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block uppercase font-medium">Compensation</span>
                    <span className="font-semibold text-emerald-600 mt-0.5 block">
                      {selectedJob.min_salary ? `$${selectedJob.min_salary.toLocaleString()} /yr` : 'Undisclosed'}
                    </span>
                  </div>
                </div>

                <div className="p-6 max-h-[550px] overflow-y-auto space-y-4">
                  <h3 className="font-bold text-gray-900 text-base border-b pb-2">Description</h3>
                  {selectedJob.description_html ? (
                    <div
                      className="prose prose-sm max-w-none text-gray-700 space-y-3 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: selectedJob.description_html }}
                    />
                  ) : (
                    <div className="text-gray-400 text-sm py-12 text-center italic">
                      Full description available directly on employer site.
                    </div>
                  )}
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center text-xs">
                  <span className="text-gray-400">ID: {selectedJob.id}</span>
                  <a
                    href={selectedJob.apply_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 font-semibold hover:underline"
                  >
                    External Application &rarr;
                  </a>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center text-gray-400 text-sm">
                Select a listing on the left to review full details.
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}