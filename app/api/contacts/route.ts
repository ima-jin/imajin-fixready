import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { contacts, type NewContact } from '@/db/schema';
import { generateId } from '@/lib/utils';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const newContact: NewContact = {
      id: generateId('contact'),
      tokenId: body.tokenId,
      name: body.name || null,
      phone: body.phone || null,
      email: body.email || null,
      role: body.role,
    };

    const [contact] = await db.insert(contacts).values(newContact).returning();

    return NextResponse.json(contact, { status: 201 });
  } catch (error) {
    console.error('Error creating contact:', error);
    return NextResponse.json(
      { error: 'Failed to create contact' },
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

    const results = await db
      .select()
      .from(contacts)
      .where(eq(contacts.tokenId, tokenId));

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 }
    );
  }
}
