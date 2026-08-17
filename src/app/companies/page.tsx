import Link from 'next/link';
import { getCompanies } from '@/lib/api';

export const metadata = {
  title: 'Hiring Companies | OpenRoles',
  description: 'Explore active companies hiring across engineering, product, and systems architecture.',
};

interface Company {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  logo_url: string | null;
  website_url: string | null;
  active_job_count: number;
}

export default async function CompaniesPage() {
  let companies: Company[] = [];

  try {
    const response = await getCompanies();
    companies = (response.data as Company[]) || [];
  } catch (err) {
    console.error('Failed to load companies:', err);
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Companies Index</h1>
        <p className="text-gray-600 mt-1">
          Discover top tech companies actively listing open positions.
        </p>
      </div>

      {companies.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies.map((company) => {
            const jobCount = company.active_job_count ?? 0;

            return (
              <Link
                key={company.id || company.slug}
                href={`/companies/${company.slug}`}
                className="group border rounded-xl p-5 bg-white shadow-sm hover:border-blue-500 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="flex items-start gap-4">
                  {company.logo_url ? (
                    <img
                      src={company.logo_url}
                      alt={`${company.name || 'Company'} logo`}
                      className="w-12 h-12 rounded-lg object-contain border bg-gray-50 p-1.5 shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg border bg-gray-100 flex items-center justify-center font-bold text-gray-500 text-lg shrink-0">
                      {company.name?.charAt(0) || 'C'}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                      {company.name || 'Untitled Company'}
                    </h3>
                    {company.category && (
                      <span className="inline-block mt-1 bg-purple-50 text-purple-700 text-xs px-2 py-0.5 rounded-full font-medium">
                        {company.category}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <span className="font-medium text-gray-700">
                    {jobCount} {jobCount === 1 ? 'open role' : 'open roles'}
                  </span>
                  <span className="text-blue-600 font-medium group-hover:translate-x-0.5 transition-transform">
                    View profile →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="border rounded-xl p-12 text-center text-gray-500 bg-white">
          No hiring companies currently found.
        </div>
      )}
    </main>
  );
}