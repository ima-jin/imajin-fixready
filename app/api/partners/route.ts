import { NextResponse } from 'next/server';
import { db } from '@/db';
import { partners } from '@/db/schema';

export async function GET() {
  try {
    const results = await db.select().from(partners);

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching partners:', error);
    return NextResponse.json(
      { error: 'Failed to fetch partners' },
      { status: 500 }
    );
  }
}
