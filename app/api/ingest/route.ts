import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { collectOpportunities } from '@/lib/sources';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const auth = req.headers.get('authorization');
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { items, sources } = await collectOpportunities();
  let upserted = 0;

  for (const item of items) {
    if (!item.applicationUrl) continue;
    try {
      await prisma.opportunity.upsert({
        where: { sourceName_externalId: { sourceName: item.sourceName, externalId: item.externalId } },
        update: {
          title: item.title,
          description: item.description,
          organization: item.organization,
          field: item.field,
          country: item.country,
          region: item.region,
          city: item.city,
          latitude: item.latitude,
          longitude: item.longitude,
          workMode: item.workMode,
          experienceRequired: item.experienceRequired,
          salary: item.salary,
          currency: item.currency,
          eligibility: item.eligibility,
          deadline: item.deadline ? new Date(item.deadline) : null,
          applicationUrl: item.applicationUrl,
          sourceUrl: item.sourceUrl,
          language: 'en',
          lastSeenAt: new Date(),
        },
        create: {
          externalId: item.externalId,
          title: item.title,
          type: item.type,
          organization: item.organization,
          description: item.description,
          field: item.field,
          country: item.country,
          region: item.region,
          city: item.city,
          latitude: item.latitude,
          longitude: item.longitude,
          workMode: item.workMode,
          experienceRequired: item.experienceRequired,
          salary: item.salary,
          currency: item.currency,
          eligibility: item.eligibility,
          deadline: item.deadline ? new Date(item.deadline) : null,
          applicationUrl: item.applicationUrl,
          sourceUrl: item.sourceUrl,
          sourceName: item.sourceName,
          language: 'en',
          verified: false,
          firstSeenAt: new Date(),
          lastSeenAt: new Date(),
        },
      });
      upserted++;
    } catch (error) {
      console.error('ATLAS ingest upsert failed', item.sourceName, item.externalId, error);
    }
  }

  // Explicit deadlines expire immediately. Listings without an explicit deadline
  // are treated as source-active and removed if they have not been seen for 7 days.
  const now = new Date();
  const staleCutoff = new Date(now.getTime() - 7 * 86400000);
  const deleted = await prisma.opportunity.deleteMany({
    where: {
      OR: [
        { deadline: { lt: now } },
        { deadline: null, lastSeenAt: { lt: staleCutoff } },
      ],
    },
  });

  return NextResponse.json({
    ok: true,
    fetched: items.length,
    upserted,
    expiredRemoved: deleted.count,
    sources: sources.map(s => ({ source: s.source, fetched: s.items.length, error: s.error ?? null })),
    updatedAt: now.toISOString(),
  });
}
