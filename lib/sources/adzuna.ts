import { Opportunity } from '../types';

export async function fetchAdzuna(countryCode='in'): Promise<Opportunity[]> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  if (!appId || !appKey) return [];
  const url = `https://api.adzuna.com/v1/api/jobs/${countryCode}/search/1?app_id=${encodeURIComponent(appId)}&app_key=${encodeURIComponent(appKey)}&results_per_page=50&content-type=application/json`;
  const res = await fetch(url, { next:{ revalidate: 0 } });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.results ?? []).map((x:any, i:number)=>({
    id:`adzuna-${countryCode}-${x.id ?? i}`, title:x.title ?? 'Untitled role', type:'JOB', organization:x.company?.display_name ?? 'Unknown company', description:String(x.description ?? '').replace(/<[^>]*>/g,'').slice(0,700), field:'General', country:countryCode==='in'?'India':countryCode, region:x.location?.area?.at(-2) ?? null, city:x.location?.display_name ?? null, latitude:Number(x.latitude)||0, longitude:Number(x.longitude)||0, workMode:/remote/i.test(x.description ?? '')?'Remote':'On-site', experienceRequired:null, salary:x.salary_min&&x.salary_max?`${x.salary_min}–${x.salary_max}`:null, currency:null, eligibility:null, deadline:x.created?new Date(new Date(x.created).getTime()+30*86400000).toISOString():new Date(Date.now()+30*86400000).toISOString(), applicationUrl:x.redirect_url, sourceUrl:x.redirect_url, sourceName:'Adzuna', verified:false
  }));
}
