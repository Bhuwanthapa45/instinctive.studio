import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idParam } = await params;
  const id = Number(idParam);

  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid incident ID' }, { status: 400 });
  }

  try {
    const incident = await prisma.incident.findUnique({ where: { id } });

    if (!incident) {
      return NextResponse.json({ error: 'Incident not found' }, { status: 404 });
    }

    if (incident.resolved) {
      return NextResponse.json({ message: 'Incident already resolved' }, { status: 200 });
    }

    const updatedIncident = await prisma.incident.update({
      where: { id },
      data: { resolved: true },
    });

    return NextResponse.json(updatedIncident);
  } catch (error) {
    console.error('Error resolving incident:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}