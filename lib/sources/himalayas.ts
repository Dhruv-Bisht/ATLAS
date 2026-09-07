import type { IngestOpportunity } from '../types';

const API = 'https://himalayas.app/jobs/api';

function classify(title: string, employmentType?: string): 'JOB' | 'INTERNSHIP' {
  const text = `${title} ${employmentType ?? ''}`.toLowerCase();
  return /intern|internship|working student|trainee/.test(text) ? 'INTERNSHIP' : 'JOB';
}

function stripHtml(value: unknown) {
  return String(value ?? '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 1200);
}

export async function fetchHimalayas(maxPages = 5): Promise<IngestOpportunity[]> {
  const results: IngestOpportunity[] = [];
  let cursor: string | undefined;

  for (let page = 0; page < maxPages; page++) {
    const url = new URL(API);
    url.searchParams.set('limit', '20');
    if (cursor) url.searchParams.set('cursor', cursor);

    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Himalayas returned ${response.status}`);

    const payload = await response.json();
    const jobs = Array.isArray(payload?.jobs) ? payload.jobs : [];

    for (const job of jobs) {
      const applicationUrl = String(job.applicationLink ?? job.applicationUrl ?? '').trim();
      if (!applicationUrl) continue;

      const countries = Array.isArray(job.countries) ? job.countries : [];
      const country = countries.length ? String(countries[0]) : (job.location ?? 'Worldwide');
      const worldwide = Boolean(job.worldwide);
      const deadline = job.expiryDate ? new Date(job.expiryDate).toISOString() : null;

      results.push({
        externalId: `himalayas-${job.guid ?? job.id ?? applicationUrl}`,
        title: String(job.title ?? 'Untitled role').trim(),
        type: classify(String(job.title ?? ''), job.employmentType),
        organization: String(job.companyName ?? job.company?.name ?? 'Unknown company').trim(),
        description: stripHtml(job.description),
        field: Array.isArray(job.parentCategories) && job.parentCategories.length ? String(job.parentCategories[0]) : 'General',
        country: worldwide ? 'Worldwide' : country,
        region: null,
        city: worldwide ? 'Remote' : String(job.location ?? country),
        latitude: Number(job.latitude) || 0,
        longitude: Number(job.longitude) || 0,
        workMode: 'Remote',
        experienceRequired: job.seniority ? String(job.seniority) : null,
        salary: job.minSalary && job.maxSalary ? `${job.minSalary}–${job.maxSalary}` : null,
        currency: job.currency ? String(job.currency) : null,
        eligibility: worldwide ? 'Worldwide' : countries.join(', ') || null,
        deadline,
        applicationUrl,
        sourceUrl: 'https://himalayas.app',
        sourceName: 'Himalayas',
        verified: false,
        language: 'en',
      });
    }

    cursor = payload?.nextCursor || undefined;
    if (!cursor) break;
  }

  return results;
}
