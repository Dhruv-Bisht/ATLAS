import type { IngestOpportunity } from '../types';

const API = 'https://www.arbeitnow.com/api/job-board-api';

function classify(title: string, tags: string[] = []): 'JOB' | 'INTERNSHIP' {
  const text = `${title} ${tags.join(' ')}`.toLowerCase();
  return /intern|internship|working student|werkstudent|trainee|apprentice/.test(text)
    ? 'INTERNSHIP'
    : 'JOB';
}

function cleanHtml(value: unknown) {
  return String(value ?? '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 1200);
}

export async function fetchArbeitnow(): Promise<IngestOpportunity[]> {
  const response = await fetch(API, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Arbeitnow returned ${response.status}`);

  const payload = await response.json();
  const jobs = Array.isArray(payload?.data) ? payload.data : [];

  return jobs
    .map((job: any, index: number) => {
      const title = String(job.title ?? 'Untitled role').trim();
      const location = String(job.location ?? '').trim();
      const remote = Boolean(job.remote) || /remote/i.test(location);
      const type = classify(title, Array.isArray(job.tags) ? job.tags : []);
      const url = String(job.url ?? job.apply_url ?? '').trim();
      const created = job.created_at ? new Date(Number(job.created_at) * 1000) : null;

      // Arbeitnow does not consistently expose a true application deadline.
      // We therefore leave deadline null rather than inventing one. The ingestion
      // layer expires listings that disappear from the source for several days.
      return {
        externalId: `arbeitnow-${job.slug ?? job.id ?? index}`,
        title,
        type,
        organization: String(job.company_name ?? 'Unknown company').trim(),
        description: cleanHtml(job.description),
        field: Array.isArray(job.tags) && job.tags.length ? String(job.tags[0]) : 'General',
        country: location || (remote ? 'Worldwide' : 'Unknown'),
        region: null,
        city: location || (remote ? 'Remote' : null),
        latitude: 0,
        longitude: 0,
        workMode: remote ? 'Remote' : 'On-site',
        experienceRequired: null,
        salary: null,
        currency: null,
        eligibility: null,
        deadline: null,
        applicationUrl: url,
        sourceUrl: url,
        sourceName: 'Arbeitnow',
        verified: false,
        language: 'en',
        _createdAt: created?.toISOString() ?? null,
      } as IngestOpportunity & { _createdAt: string | null };
    })
    .filter((job: IngestOpportunity) => job.applicationUrl);
}
