import crypto from 'crypto';
import { NormalizedJob } from './greenhouse';

interface LeverJobPayload {
  id: string;
  text: string;
  hostedUrl: string;
  createdAt: number;
  categories: {
    location?: string;
    department?: string;
    commitment?: string;
  };
  description?: string;
  descriptionPlain?: string;
  workplaceType?: string;
}

export class LeverImporter {
  private baseUrl = 'https://api.lever.co/v0/postings';

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

  private parseRemoteStatus(locationStr: string, titleStr: string, workplaceType?: string): boolean {
    const combined = `${locationStr} ${titleStr} ${workplaceType || ''}`.toLowerCase();
    return combined.includes('remote') || combined.includes('anywhere') || combined.includes('work from home');
  }

  async fetchJobs(boardToken: string, companyName: string): Promise<NormalizedJob[]> {
    const endpoint = `${this.baseUrl}/${boardToken}?mode=json`;

    const response = await fetch(endpoint, {
      headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Lever board for "${boardToken}": ${response.statusText}`);
    }

    const jobs: LeverJobPayload[] = await response.json();

    return jobs.map((job) => {
      const locationRaw = job.categories?.location || 'Remote';
      const isRemote = this.parseRemoteStatus(locationRaw, job.text, job.workplaceType);
      const descriptionHtml = job.description || job.descriptionPlain || '';
      const sourceJobId = job.id;

      return {
        sourceJobId,
        title: job.text.trim(),
        slug: this.generateSlug(job.text, companyName, sourceJobId),
        applyUrl: job.hostedUrl,
        locationRaw,
        isRemote,
        department: job.categories?.department || null,
        descriptionHtml,
        publishedAt: new Date(job.createdAt),
        contentHash: this.computeHash(job.text, locationRaw, descriptionHtml),
      };
    });
  }
}