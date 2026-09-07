import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { demoOpportunities } from '@/lib/seed-data';

export const dynamic = 'force-dynamic';

export async function GET() {
  const now = new Date();
  const staleCutoff = new Date(now.getTime() - 7 * 86400000);
  try {
    const rows = await prisma.opportunity.findMany({
      where: {
        language: 'en',
        OR: [
          { deadline: { gte: now } },
          { deadline: null, lastSeenAt: { gte: staleCutoff } },
        ],
      },
      orderBy: [{ deadline: 'asc' }, { lastSeenAt: 'desc' }],
    });
    if (rows.length) return NextResponse.json(rows);
  } catch (error) {
    console.error('ATLAS opportunities API fallback', error);
  }
  return NextResponse.json(demoOpportunities.filter(o => !o.deadline || new Date(o.deadline) >= now));
}
