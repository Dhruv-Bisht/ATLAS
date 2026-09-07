export async function firecrawlSearch(query: string) {
  const key = process.env.FIRECRAWL_API_KEY;
  if (!key) return [];
  const res = await fetch('https://api.firecrawl.dev/v2/search', { method:'POST', headers:{'Content-Type':'application/json','Authorization':`Bearer ${key}`}, body:JSON.stringify({query, limit:10}) });
  if (!res.ok) throw new Error(`Firecrawl HTTP ${res.status}`);
  const data = await res.json();
  return data?.data ?? data?.results ?? [];
}

export async function firecrawlScrape(url: string) {
  const key = process.env.FIRECRAWL_API_KEY;
  if (!key) return null;
  const res = await fetch('https://api.firecrawl.dev/v2/scrape', { method:'POST', headers:{'Content-Type':'application/json','Authorization':`Bearer ${key}`}, body:JSON.stringify({url, formats:['markdown']}) });
  if (!res.ok) throw new Error(`Firecrawl scrape HTTP ${res.status}`);
  return res.json();
}
