import crypto from 'crypto';
import { NormalizedJob } from './greenhouse';

interface WorkableWidgetJob {
  shortcode: string;
  title: string;
  department?: string;
  section?: string;
  city?: string;
  region?: string;
  country?: string;
  telecommute?: boolean;
  url: string;
  published?: string;
  description?: string;
  requirements?: string;
}

interface WorkableWidgetResponse {
  name?: string;
  jobs?: WorkableWidgetJob[];
}

export class WorkableImporter {
  async fetchJobs(boardToken: string, companyName: string): Promise<NormalizedJob[]> {
    const endpoint = `https://apply.workable.com/api/v1/widget/accounts/${encodeURIComponent(boardToken)}`;
    
    const response = await fetch(endpoint, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'OpenRoles-Engine/1.0',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Not Found: Workable account token '${boardToken}' invalid or account inactive.`);
      }
      throw new Error(`Workable API HTTP error! status: ${response.status}`);
    }

    const data = (await response.json()) as WorkableWidgetResponse;
    const rawJobs = data.jobs || [];

    return rawJobs.map((job) => {
      const sourceJobId = job.shortcode;
      const title = job.title.trim();

      // Format location from Workable fields
      const locationParts = [job.city, job.region, job.country].filter(Boolean);
      const locationRaw = locationParts.length > 0 ? locationParts.join(', ') : 'Unspecified';
      const isRemote = Boolean(job.telecommute);

      // Department fallback
      const department = job.department || job.section || 'General';

      // Application link construction
      const applyUrl = job.url || `https://apply.workable.com/${boardToken}/j/${sourceJobId}/`;

      // Description formatting
      const descriptionHtml = [job.description, job.requirements].filter(Boolean).join('\n') || '';

      // Hash content to detect updates in sync.ts
      const contentHash = crypto
        .createHash('sha256')
        .update(`${title}|${locationRaw}|${department}|${descriptionHtml}`)
        .digest('hex');

      // Generate base URL slug
      const slug = this.slugify(`${companyName}-${title}`);

      return {
        sourceJobId,
        title,
        slug,
        applyUrl,
        locationRaw,
        isRemote,
        department,
        descriptionHtml,
        contentHash,
        publishedAt: job.published ? new Date(job.published) : new Date(),
      };
    });
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}