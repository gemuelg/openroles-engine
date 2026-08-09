
import crypto from 'crypto';

export interface NormalizedJob {
  sourceJobId: string;
  title: string;
  slug: string;
  applyUrl: string;
  locationRaw: string;
  isRemote: boolean;
  department: string | null;
  descriptionHtml: string;
  publishedAt: Date;
  contentHash: string;
}

interface GreenhouseJobPayload {
  id: number;
  title: string;
  updated_at: string;
  absolute_url: string;
  location: { name: string };
  departments?: Array<{ name: string }>;
  content?: string;
}

export class GreenhouseImporter {
  private baseUrl = 'https://boards-api.greenhouse.io/v1/boards';

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

  private parseRemoteStatus(locationStr: string, titleStr: string): boolean {
    const combined = `${locationStr} ${titleStr}`.toLowerCase();
    return combined.includes('remote') || combined.includes('anywhere') || combined.includes('work from home');
  }

  async fetchJobs(boardToken: string, companyName: string): Promise<NormalizedJob[]> {
    const endpoint = `${this.baseUrl}/${boardToken}/jobs?content=true`;
    
    const response = await fetch(endpoint, {
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Greenhouse board for "${boardToken}": ${response.statusText}`);
    }

    const data = await response.json();
    const jobs: GreenhouseJobPayload[] = data.jobs || [];

    return jobs.map((job) => {
      const locationRaw = job.location?.name || 'Remote';
      const isRemote = this.parseRemoteStatus(locationRaw, job.title);
      const descriptionHtml = job.content || '';
      const sourceJobId = String(job.id);

      return {
        sourceJobId,
        title: job.title.trim(),
        slug: this.generateSlug(job.title, companyName, sourceJobId),
        applyUrl: job.absolute_url,
        locationRaw,
        isRemote,
        department: job.departments?.[0]?.name || null,
        descriptionHtml,
        publishedAt: new Date(job.updated_at),
        contentHash: this.computeHash(job.title, locationRaw, descriptionHtml),
      };
    });
  }
}