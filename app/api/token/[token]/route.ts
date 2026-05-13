import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { registrationTokens, partners, locations, contacts, appliances } from '@/db/schema';
import { eq, count } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // Find the token
    const tokenRecord = await db.query.registrationTokens.findFirst({
      where: eq(registrationTokens.id, token),
      with: {
        partner: true,
      },
    });

    if (!tokenRecord) {
      return NextResponse.json(
        { error: 'Token not found' },
        { status: 404 }
      );
    }

    // Check expiry
    if (tokenRecord.expiresAt && new Date(tokenRecord.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: 'Token expired' },
        { status: 410 }
      );
    }

    // Increment scan count
    await db
      .update(registrationTokens)
      .set({ scans: (tokenRecord.scans || 0) + 1 })
      .where(eq(registrationTokens.id, token));

    // Fetch location for this token
    const locationRecord = await db.query.locations.findFirst({
      where: eq(locations.tokenId, token),
    });

    // Fetch contacts for this token
    const contactsList = await db
      .select()
      .from(contacts)
      .where(eq(contacts.tokenId, token));

    // Count appliances for this token
    const [applianceCountResult] = await db
      .select({ count: count() })
      .from(appliances)
      .where(eq(appliances.tokenId, token));

    return NextResponse.json({
      token: tokenRecord,
      partner: tokenRecord.partner,
      location: locationRecord || null,
      contacts: contactsList,
      applianceCount: applianceCountResult.count,
    });
  } catch (error) {
    console.error('Error validating token:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
