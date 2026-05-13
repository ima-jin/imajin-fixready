import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { appliances, type NewAppliance } from '@/db/schema';
import { generateId } from '@/lib/utils';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const newAppliance: NewAppliance = {
      id: generateId('appliance'),
      partnerId: body.partnerId,
      tokenId: body.tokenId,
      locationId: body.locationId,
      type: body.type,
      brand: body.brand || null,
      model: body.model || null,
      serial: body.serial || null,
      ageRange: body.ageRange || null,
      room: body.room || null,
    };

    const [appliance] = await db.insert(appliances).values(newAppliance).returning();

    return NextResponse.json(appliance, { status: 201 });
  } catch (error) {
    console.error('Error creating appliance:', error);
    return NextResponse.json(
      { error: 'Failed to create appliance' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const partnerId = searchParams.get('partnerId');
    const tokenId = searchParams.get('tokenId');

    let query = db.select().from(appliances) as any;

    if (partnerId) {
      query = query.where(eq(appliances.partnerId, partnerId));
    }

    if (tokenId) {
      query = query.where(eq(appliances.tokenId, tokenId));
    }

    const results = await query;

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching appliances:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appliances' },
      { status: 500 }
    );
  }
}
