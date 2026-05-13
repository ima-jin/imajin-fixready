import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { appliances } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const appliance = await db.query.appliances.findFirst({
      where: eq(appliances.id, id),
      with: {
        location: true,
      },
    });

    if (!appliance) {
      return NextResponse.json(
        { error: 'Appliance not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(appliance);
  } catch (error) {
    console.error('Error fetching appliance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appliance' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const allowedFields: Record<string, unknown> = {};
    if ('brand' in body) allowedFields.brand = body.brand;
    if ('model' in body) allowedFields.model = body.model;
    if ('serial' in body) allowedFields.serial = body.serial || null;
    if ('ageRange' in body) allowedFields.ageRange = body.ageRange;
    if ('room' in body) allowedFields.room = body.room;

    const [updated] = await db
      .update(appliances)
      .set(allowedFields)
      .where(eq(appliances.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: 'Appliance not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating appliance:', error);
    return NextResponse.json(
      { error: 'Failed to update appliance' },
      { status: 500 }
    );
  }
}
