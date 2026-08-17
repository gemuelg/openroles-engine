import { getStats } from '@/lib/api';

export default async function StatsBar() {
  let stats = {
    total_active_jobs: 0,
    total_active_companies: 0,
    total_remote_jobs: 0,
    jobs_with_salary: 0,
  };

  try {
    const response = await getStats();
    if (response?.data) {
      stats = response.data;
    }
  } catch (err) {
    console.error('Failed to fetch engine stats:', err);
  }

  const items = [
    { label: 'Active Roles', value: stats.total_active_jobs, accent: 'text-slate-900' },
    { label: 'Hiring Companies', value: stats.total_active_companies, accent: 'text-slate-900' },
    { label: 'Remote Openings', value: stats.total_remote_jobs, accent: 'text-slate-900' },
    { label: 'Salary Disclosed', value: stats.jobs_with_salary, accent: 'text-emerald-600' },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
      {items.map((item, index) => (
        <div key={item.label} className={`flex flex-col justify-between ${index !== 0 ? 'pt-3 sm:pt-0 sm:pl-5' : ''}`}>
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
            {item.label}
          </span>
          <span className={`mt-1 text-2xl font-bold tracking-tight ${item.accent}`}>
            {item.value ? item.value.toLocaleString() : '0'}
          </span>
        </div>
      ))}
    </div>
  );
}