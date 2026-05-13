import { getSession } from '@/lib/auth';

export interface ImajinProfile {
  did: string;
  displayName?: string;
  handle?: string;
  avatar?: string;
}

/**
 * Build headers for kernel API calls.
 * Uses the session's attestation ID (per-user consent) when available,
 * falls back to env var for service-level calls.
 */
async function getHeaders(): Promise<Record<string, string>> {
  const appDid = process.env.IMAJIN_APP_DID;

  // Try session attestation first (per-user), fall back to env var (service-level)
  const session = await getSession().catch(() => null);
  const attestationId = session?.attestationId ?? process.env.IMAJIN_APP_ATTESTATION_ID;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Only send app auth headers when we have BOTH — sending X-App-DID
  // without X-App-Authorization triggers a 401 instead of falling
  // through to the unauthenticated path (which works for public data).
  if (appDid && attestationId) {
    headers['X-App-DID'] = appDid;
    headers['X-App-Authorization'] = attestationId;
  }

  return headers;
}

export async function fetchImajinProfile(did: string): Promise<ImajinProfile | null> {
  const authUrl = process.env.IMAJIN_AUTH_URL;
  if (!authUrl) {
    console.error('IMAJIN_AUTH_URL is not set');
    return null;
  }

  const res = await fetch(`${authUrl}/profile/api/profile/${encodeURIComponent(did)}`, {
    headers: await getHeaders(),
  });

  if (!res.ok) {
    if (res.status === 404) return null;
    console.error('Failed to fetch Imajin profile:', res.status, await res.text());
    return null;
  }

  return res.json();
}
