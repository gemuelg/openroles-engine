import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCompanyBySlug } from '@/lib/api';

interface Job {
  id: string;
  title: string;
  slug: string;
  location_raw?: string | null;
  normalized_department?: string | null;
  min_salary?: number | null;
  max_salary?: number | null;
  currency?: string | null;
}

interface Company {
  id: string;
  name: string;
  slug: string;
  category?: string | null;
  logo_url?: string | null;
  website_url?: string | null;
  jobs?: Job[];
}

interface CompanyPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: CompanyPageProps) {
  const { slug } = await params;
  try {
    const { data: company } = await getCompanyBySlug(slug);
    if (!company) {
      return { title: 'Company Not Found | OpenRoles' };
    }
    return {
      title: `${company.name} Open Positions | OpenRoles`,
      description: `Browse all active job openings at ${company.name}.`,
    };
  } catch {
    return {
      title: 'Company Not Found | OpenRoles',
    };
  }
}

export default async function CompanyPage({ params }: CompanyPageProps) {
  const { slug } = await params;
  let company: Company | null = null;

  try {
    const response = await getCompanyBySlug(slug);
    company = response.data || null;
  } catch {
    notFound();
  }

  if (!company) {
    notFound();
  }

  const jobsCount = company.jobs?.length || 0;

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      {/* Navigation Back Link */}
      <Link
        href="/companies"
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
      >
        ← Back to all companies
      </Link>

      {/* Company Header Card */}
      <div className="border rounded-xl p-6 bg-white shadow-sm mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          {company.logo_url ? (
            <img
              src={company.logo_url}
              alt={`${company.name || 'Company'} logo`}
              className="w-16 h-16 rounded-lg object-contain border bg-gray-50 p-2 shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-lg border bg-gray-100 flex items-center justify-center font-bold text-gray-500 text-xl shrink-0">
              {company.name?.charAt(0) || 'C'}
            </div>
          )}

          <div>
            <h1 className="text-2xl font-bold text-gray-900">{company.name || 'Company Profile'}</h1>
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
              {company.category && (
                <span className="bg-purple-50 text-purple-700 text-xs px-2.5 py-0.5 rounded-full font-medium">
                  {company.category}
                </span>
              )}
              {company.category && <span>•</span>}
              <span>
                {jobsCount} {jobsCount === 1 ? 'active role' : 'active roles'}
              </span>
            </div>
          </div>
        </div>

        {company.website_url && (
          <a
            href={company.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            Visit Website ↗
          </a>
        )}
      </div>

      {/* Roles Directory */}
      <h2 className="text-lg font-bold text-gray-900 mb-4">
        Open Positions at {company.name || 'Company'}
      </h2>

      {company.jobs && company.jobs.length > 0 ? (
        <div className="space-y-3">
          {company.jobs.map((job) => (
            <Link
              key={job.id || job.slug}
              href={`/jobs/${job.slug}`}
              className="block border rounded-lg p-5 bg-white hover:border-blue-500 transition-all shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-gray-900">{job.title}</h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                    <span>{job.location_raw || 'Remote'}</span>
                    {job.normalized_department && (
                      <>
                        <span>•</span>
                        <span>{job.normalized_department}</span>
                      </>
                    )}
                  </div>
                </div>
                {job.max_salary && (
                  <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full self-start sm:self-auto">
                    {job.min_salary ? `$${job.min_salary.toLocaleString()} - ` : ''}
                    ${job.max_salary.toLocaleString()} {job.currency || 'USD'}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="border rounded-xl p-8 text-center text-gray-500 bg-white">
          No active positions currently open at {company.name || 'this company'}.
        </div>
      )}
    </main>
  );
}