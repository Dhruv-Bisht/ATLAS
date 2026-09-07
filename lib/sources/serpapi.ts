import type { IngestOpportunity } from '../types';

export async function fetchSerpApiJobs(query = 'software engineering internship', location = 'India'): Promise<IngestOpportunity[]> {
  const key = process.env.SERPAPI_KEY;
  if (!key) return [];
  const url = `https://serpapi.com/search.json?engine=google_jobs&q=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}&api_key=${encodeURIComponent(key)}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`SerpApi HTTP ${res.status}`);
  const data = await res.json();
  return (data.jobs_results ?? []).map((x:any, i:number) => ({
    externalId: `serpapi-${x.job_id ?? `${query}-${i}`}`,
    title: x.title ?? 'Untitled role', type: /intern/i.test(x.title ?? '') ? 'INTERNSHIP' : 'JOB',
    organization: x.company_name ?? 'Unknown company', description: String(x.description ?? '').slice(0,700),
    field: 'General', country: location, region: null, city: x.location ?? null, latitude: 0, longitude: 0,
    workMode: /remote/i.test(x.location ?? '') ? 'Remote' : null, experienceRequired: null, salary: null, currency: null,
    eligibility: null, deadline: null, applicationUrl: x.apply_options?.[0]?.link ?? x.share_link ?? '',
    sourceUrl: x.share_link ?? x.apply_options?.[0]?.link ?? null, sourceName: 'Google Jobs via SerpApi', verified: false, language: 'en'
  }));
}
