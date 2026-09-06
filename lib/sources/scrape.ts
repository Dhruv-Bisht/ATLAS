import * as cheerio from 'cheerio';
import { Opportunity } from '../types';

// Generic, intentionally conservative scraper. It only publishes a page when
// the page contains an explicit title + application link + recognizable deadline.
export async function scrapeOpportunityPage(url:string, meta:Partial<Opportunity>):Promise<Opportunity|null>{
  try {
    const res=await fetch(url,{headers:{'user-agent':process.env.GEOCODER_USER_AGENT ?? 'ATLAS opportunity research bot'},next:{revalidate:0}});
    if(!res.ok)return null;
    const html=await res.text(); const $=cheerio.load(html);
    const text=$('body').text().replace(/\s+/g,' ').trim();
    const deadlineMatch=text.match(/(?:deadline|apply by|applications? close(?:s)?|closing date)\D{0,60}(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{1,2}\s+[A-Za-z]+\s+\d{4}|[A-Za-z]+\s+\d{1,2},\s+\d{4})/i);
    if(!deadlineMatch)return null;
    const deadline=new Date(deadlineMatch[1]); if(Number.isNaN(deadline.getTime()))return null;
    const title=$('h1').first().text().trim() || $('title').text().trim();
    const applicationUrl=$('a').filter((_,el)=>/apply|application/i.test($(el).text())).first().attr('href') || url;
    const absolute=applicationUrl.startsWith('http')?applicationUrl:new URL(applicationUrl,url).href;
    if(!title)return null;
    return {id:`scrape-${Buffer.from(url).toString('base64url').slice(0,24)}`,title,type:(meta.type ?? 'JOB') as Opportunity['type'],organization:meta.organization ?? new URL(url).hostname,description:text.slice(0,700),field:meta.field ?? 'General',country:meta.country ?? 'Unknown',region:meta.region ?? null,city:meta.city ?? null,latitude:meta.latitude ?? 0,longitude:meta.longitude ?? 0,workMode:meta.workMode ?? null,experienceRequired:meta.experienceRequired ?? null,salary:meta.salary ?? null,currency:meta.currency ?? null,eligibility:meta.eligibility ?? null,deadline:deadline.toISOString(),applicationUrl:absolute,sourceUrl:url,sourceName:meta.sourceName ?? 'Web source',verified:false};
  } catch { return null; }
}
