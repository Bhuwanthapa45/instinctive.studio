import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH() {
  try {
    await prisma.incident.updateMany({
      data: {
       
        resolved: false,
      },
    });

    return NextResponse.json({ success: true, message: 'All incidents reset to unresolved.' });
  } catch (error) {
    console.error('Error resetting incidents:', error);
    return NextResponse.json({ error: 'Failed to reset incidents' }, { status: 500 });
  }
}
