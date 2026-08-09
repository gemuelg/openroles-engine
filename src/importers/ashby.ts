import crypto from 'crypto';
import { NormalizedJob } from './greenhouse';

interface AshbyJobPayload {
  id: string;
  title: string;
  locationName: string;
  departmentName?: string;
  employmentType?: string;
  publishedAt?: string;
  jobUrl: string;
  descriptionHtml?: string;
  isRemote?: boolean;
}

export class AshbyImporter {
  private baseUrl = 'https://api.ashbyhq.com/posting-api/job-board';

  private generateSlug(title: string, companyName: string, id: string): string {
    const raw = `${title}-${companyName}-${id}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    return raw;
  }

  private computeHash(title: string, location: string, content: string): string {
    return crypto
      .createHash('sha256')
      .update(`${title}|${location}|${content}`)
      .digest('hex');
  }

  async fetchJobs(boardToken: string, companyName: string): Promise<NormalizedJob[]> {
    const endpoint = `${this.baseUrl}/${boardToken}?includeDetails=true`;

    const response = await fetch(endpoint, {
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Ashby board for "${boardToken}": ${response.statusText}`);
    }

    const data = await response.json();
    const jobs: AshbyJobPayload[] = data.jobs || [];

    return jobs.map((job) => {
      const locationRaw = job.locationName || 'Remote';
      const isRemote = job.isRemote || locationRaw.toLowerCase().includes('remote');
      const descriptionHtml = job.descriptionHtml || '';
      const sourceJobId = job.id;

      return {
        sourceJobId,
        title: job.title.trim(),
        slug: this.generateSlug(job.title, companyName, sourceJobId),
        applyUrl: job.jobUrl,
        locationRaw,
        isRemote,
        department: job.departmentName || null,
        descriptionHtml,
        publishedAt: job.publishedAt ? new Date(job.publishedAt) : new Date(),
        contentHash: this.computeHash(job.title, locationRaw, descriptionHtml),
      };
    });
  }
}