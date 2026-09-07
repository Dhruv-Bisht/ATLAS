import type { IngestOpportunity } from '../types';
import { fetchArbeitnow } from './arbeitnow';
import { fetchHimalayas } from './himalayas';
import { fetchAdzuna } from './adzuna';
import { scholarshipCatalog } from '../scholarship-catalog';
import { normalizeLocation, resolveCoordinates } from './location';
import { fetchSerpApiJobs } from './serpapi';

export type SourceResult = { source: string; items: IngestOpportunity[]; error?: string };

async function safe(source: string, fn: () => Promise<IngestOpportunity[]>): Promise<SourceResult> {
  try { return { source, items: await fn() }; }
  catch (error) { return { source, items: [], error: error instanceof Error ? error.message : String(error) }; }
}

export async function collectOpportunities(): Promise<{ items: IngestOpportunity[]; sources: SourceResult[] }> {
  const results = await Promise.all([
    safe('Arbeitnow', fetchArbeitnow),
    safe('Himalayas', () => fetchHimalayas(5)),
    safe('Scholarship Programs', async () => scholarshipCatalog),
    safe('SerpApi', async () => process.env.SERPAPI_KEY ? fetchSerpApiJobs() : []),
    safe('Adzuna', async () => {
      if (!process.env.ADZUNA_APP_ID || !process.env.ADZUNA_APP_KEY) return [];
      return [...(await fetchAdzuna('in')), ...(await fetchAdzuna('gb')), ...(await fetchAdzuna('de'))];
    }),
  ]);

  const normalized = results.flatMap(r => r.items).map(item => {
    const location = normalizeLocation(item.country, item.city);
    const coords = resolveCoordinates(location.country, location.city, item.latitude, item.longitude);
    if (!coords) return null;
    return { ...item, country: location.country, city: location.city, latitude: coords[0], longitude: coords[1] };
  }).filter(Boolean) as IngestOpportunity[];

  const seen = new Set<string>();
  const deduped = normalized.filter(item => {
    const key = `${item.applicationUrl}|${item.title.toLowerCase()}|${item.organization.toLowerCase()}|${item.city ?? item.country}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return { items: deduped, sources: results };
}
