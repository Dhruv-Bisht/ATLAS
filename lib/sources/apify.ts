export async function runApifyActor(actorId: string, input: Record<string, unknown> = {}) {
  const token = process.env.APIFY_API_TOKEN;
  if (!token) return null;
  const encodedActor = actorId.replace('/', '~');
  const res = await fetch(`https://api.apify.com/v2/acts/${encodeURIComponent(encodedActor)}/run-sync-get-dataset-items?token=${encodeURIComponent(token)}`, {
    method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(input), cache:'no-store'
  });
  if (!res.ok) throw new Error(`Apify HTTP ${res.status}`);
  return res.json();
}
