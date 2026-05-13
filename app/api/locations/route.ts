import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { locations, type NewLocation } from '@/db/schema';
import { generateId } from '@/lib/utils';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Check if location already exists for this token
    const existing = await db.query.locations.findFirst({
      where: eq(locations.tokenId, body.tokenId),
    });

    if (existing) {
      return NextResponse.json(existing, { status: 200 });
    }

    const newLocation: NewLocation = {
      id: generateId('location'),
      tokenId: body.tokenId,
      address: body.address,
      unit: body.unit || null,
      city: body.city || null,
      province: body.province || null,
      postalCode: body.postalCode || null,
    };

    const [location] = await db.insert(locations).values(newLocation).returning();

    return NextResponse.json(location, { status: 201 });
  } catch (error) {
    console.error('Error creating location:', error);
    return NextResponse.json(
      { error: 'Failed to create location' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tokenId = searchParams.get('tokenId');

    if (!tokenId) {
      return NextResponse.json(
        { error: 'tokenId is required' },
        { status: 400 }
      );
    }

    const location = await db.query.locations.findFirst({
      where: eq(locations.tokenId, tokenId),
    });

    if (!location) {
      return NextResponse.json(
        { error: 'Location not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(location);
  } catch (error) {
    console.error('Error fetching location:', error);
    return NextResponse.json(
      { error: 'Failed to fetch location' },
      { status: 500 }
    );
  }
}
