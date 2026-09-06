import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { fetchAdzuna } from '@/lib/sources/adzuna';

export const maxDuration = 60;

export async function GET(req:Request){
  const auth=req.headers.get('authorization');
  if(process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({error:'Unauthorized'},{status:401});
  const all=[...(await fetchAdzuna('in')),...(await fetchAdzuna('gb')),...(await fetchAdzuna('de'))];
  let upserted=0;
  for(const item of all){
    if(!item.applicationUrl || !item.latitude || !item.longitude || new Date(item.deadline)<new Date()) continue;
    try{
      await prisma.opportunity.upsert({where:{sourceName_externalId:{sourceName:item.sourceName,externalId:item.id}},update:{...item,lastSeenAt:new Date()},create:{...item,externalId:item.id,lastSeenAt:new Date()}});
      upserted++;
    }catch{}
  }
  try{ await prisma.opportunity.deleteMany({where:{deadline:{lt:new Date()}}}); }catch{}
  return NextResponse.json({ok:true, fetched:all.length, upserted, expiredRemoved:true, updatedAt:new Date().toISOString()});
}
