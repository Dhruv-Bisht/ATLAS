import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { demoOpportunities } from '@/lib/seed-data';

export async function GET(){
  const now = new Date();
  try {
    const rows = await prisma.opportunity.findMany({ where:{ deadline:{gte:now}, language:'en' }, orderBy:{deadline:'asc'} });
    if (rows.length) return NextResponse.json(rows);
  } catch {}
  return NextResponse.json(demoOpportunities.filter(o=>new Date(o.deadline)>=now));
}
