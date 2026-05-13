import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { registrationTokens, type NewRegistrationToken } from '@/db/schema';
import { generateToken } from '@/lib/utils';
import { eq, desc } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.partnerId || typeof body.partnerId !== 'string') {
      return NextResponse.json(
        { error: 'partnerId is required' },
        { status: 400 }
      );
    }

    const newToken: NewRegistrationToken = {
      id: generateToken(),
      partnerId: body.partnerId,
      label: body.label || null,
    };

    const [tokenRecord] = await db
      .insert(registrationTokens)
      .values(newToken)
      .returning();

    return NextResponse.json(tokenRecord, { status: 201 });
  } catch (error) {
    console.error('Error creating token:', error);
    return NextResponse.json(
      { error: 'Failed to create token' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const partnerId = searchParams.get('partnerId');

    let results;

    if (partnerId) {
      results = await db.query.registrationTokens.findMany({
        with: {
          partner: true,
        },
        where: eq(registrationTokens.partnerId, partnerId),
        orderBy: desc(registrationTokens.createdAt),
      });
    } else {
      results = await db.query.registrationTokens.findMany({
        with: {
          partner: true,
        },
        orderBy: desc(registrationTokens.createdAt),
      });
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching tokens:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tokens' },
      { status: 500 }
    );
  }
}
