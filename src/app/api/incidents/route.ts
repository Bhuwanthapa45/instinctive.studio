import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const resolved = searchParams.get('resolved');

  const incidents = await prisma.incident.findMany({
    where: {
      resolved: resolved === null ? undefined : resolved === 'true',
    },
    orderBy: {
      tsStart: 'desc',
    },
    include: {
      camera: true, // include camera info for frontend display
    },
  });

  return NextResponse.json(incidents);
}
