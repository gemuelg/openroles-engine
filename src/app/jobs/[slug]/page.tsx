import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getJobBySlug } from '@/lib/api';

interface JobPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: JobPageProps) {
  const { slug } = await params;

  try {
    const response = await getJobBySlug(slug);
    const job = response?.data;

    if (!job) {
      return { title: 'Job Not Found | OpenRoles' };
    }

    return {
      title: `${job.title} at ${job.company_name} | OpenRoles`,
      description: `Apply for the ${job.title} position at ${job.company_name}. ${
        job.location_raw ? `Location: ${job.location_raw}` : ''
      }`,
    };
  } catch {
    return {
      title: 'Job Not Found | OpenRoles',
    };
  }
}

export default async function JobPage({ params }: JobPageProps) {
  const { slug } = await params;
  let job;

  try {
    const response = await getJobBySlug(slug);
    job = response.data;
  } catch (err) {
    notFound();
  }

  if (!job) {
    notFound();
  }

  // Format published date
  const formattedDate = job.published_at
    ? new Date(job.published_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Navigation Back Link */}
      <Link
        href="/"
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
      >
        ← Back to all jobs
      </Link>

      {/* Main Job Header Box */}
      <div className="border rounded-xl p-6 bg-white shadow-sm mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            {job.company_logo ? (
              <img
                src={job.company_logo}
                alt={`${job.company_name} logo`}
                className="w-16 h-16 rounded-lg object-contain border bg-gray-50 p-2 shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg border bg-gray-100 flex items-center justify-center font-bold text-gray-500 text-xl shrink-0">
                {job.company_name?.charAt(0) || 'J'}
              </div>
            )}

            <div>
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">{job.title}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-600">
                <span className="font-semibold text-gray-800">{job.company_name}</span>
                <span>•</span>
                <span>{job.location_raw || 'Remote'}</span>
                {formattedDate && (
                  <>
                    <span>•</span>
                    <span>Posted {formattedDate}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* External Apply Button */}
          <a
            href={job.apply_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors text-center shrink-0"
          >
            Apply for this role ↗
          </a>
        </div>

        {/* Structured Tags Bar */}
        <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-gray-100">
          {job.normalized_department && (
            <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full font-medium">
              {job.normalized_department}
            </span>
          )}
          {job.workplace_type && (
            <span className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full font-medium">
              {job.workplace_type.replace('_', ' ')}
            </span>
          )}
          {job.company_category && (
            <span className="bg-purple-50 text-purple-700 text-xs px-3 py-1 rounded-full font-medium">
              {job.company_category}
            </span>
          )}
          {job.max_salary && (
            <span className="bg-emerald-50 text-emerald-700 text-xs px-3 py-1 rounded-full font-medium">
              {job.min_salary ? `$${job.min_salary.toLocaleString()} - ` : ''}
              ${job.max_salary.toLocaleString()} {job.currency || 'USD'}
            </span>
          )}
        </div>
      </div>

      {/* HTML Job Description Rendering */}
      <div className="bg-white border rounded-xl p-8 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Job Description</h2>

        {job.description_html ? (
          <div
            className="prose prose-blue max-w-none text-gray-700 leading-relaxed
              [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-6 [&_h1]:mb-3
              [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-5 [&_h2]:mb-2
              [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2
              [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-4
              [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-4
              [&_li]:mb-1
              [&_p]:mb-4"
            dangerouslySetInnerHTML={{ __html: job.description_html }}
          />
        ) : (
          <p className="text-gray-500 italic">No detailed description was provided for this job.</p>
        )}

        {/* Footer Apply CTA */}
        <div className="mt-12 pt-6 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            Applications are processed directly on {job.company_name}&apos;s official careers page.
          </p>
          <a
            href={job.apply_url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-lg transition-colors w-full sm:w-auto text-center"
          >
            Apply Now ↗
          </a>
        </div>
      </div>
    </div>
  );
}