'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/button';
import { ImajinAuth } from '@/components/ImajinAuth';
import { ApplianceCard } from '@/components/appliance-card';

interface TokenData {
  partner: {
    id: string;
    name: string;
    logoUrl: string | null;
  };
  location: {
    id: string;
    address: string;
    unit: string | null;
  } | null;
  contacts: Array<{
    id: string;
    name: string | null;
    phone: string | null;
    email: string | null;
    role: string;
  }>;
  applianceCount: number;
}

export default function LandingPage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const [data, setData] = useState<TokenData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appliances, setAppliances] = useState<any[]>([]);

  useEffect(() => {
    async function validateToken() {
      if (!params.token) return;
      try {
        const response = await fetch(`/api/token/${params.token}`);

        if (!response.ok) {
          throw new Error('Invalid or expired token');
        }

        const tokenData = await response.json();
        setData(tokenData);

        // If returning with appliances, fetch them
        if (tokenData.applianceCount > 0) {
          const appliancesRes = await fetch(`/api/appliances?tokenId=${params.token}`);
          if (appliancesRes.ok) {
            setAppliances(await appliancesRes.json());
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    }

    validateToken();
  }, [params.token]);

  const handleStart = () => {
    router.push(`/go/${params.token}/contact`);
  };

  const handleAddAnother = () => {
    router.push(`/go/${params.token}/type`);
  };

  const handleNewContact = () => {
    // Clear contact_id so they can register as a new person
    sessionStorage.removeItem('contact_id');
    router.push(`/go/${params.token}/contact`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid QR Code</h1>
          <p className="text-gray-600">
            This QR code is invalid or has expired. Please contact your service provider.
          </p>
        </div>
      </div>
    );
  }

  const hasAppliances = data.applianceCount > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Auth header — Tier 3 power user, non-blocking */}
      <div className="flex justify-end px-4 pt-4">
        <ImajinAuth />
      </div>

      <div className="max-w-md mx-auto px-4 py-8">
        {/* Partner branding */}
        <div className="text-center mb-8">
          {data.partner.logoUrl && (
            <img
              src={data.partner.logoUrl}
              alt={data.partner.name}
              className="h-16 mx-auto mb-4"
            />
          )}
          <div className="text-sm text-gray-600">{data.partner.name}</div>
        </div>

        {hasAppliances ? (
          /* Returning visitor view */
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h1 className="text-xl font-bold text-gray-900 mb-2">
                Appliances at this Location
              </h1>
              {data.location && (
                <p className="text-sm text-gray-600 mb-4">
                  📍 {data.location.address}
                  {data.location.unit && ` - ${data.location.unit}`}
                </p>
              )}

              <div className="space-y-3 mb-6">
                {appliances.map((appliance) => (
                  <ApplianceCard key={appliance.id} appliance={appliance} location={data.location} />
                ))}
              </div>

              <Button fullWidth onClick={handleAddAnother}>
                Add Another Appliance
              </Button>
            </div>

            <div className="text-center">
              <button
                onClick={handleNewContact}
                className="text-sm text-blue-600 hover:underline"
              >
                I&apos;m a new contact for this location
              </button>
            </div>
          </div>
        ) : (
          /* First-time visitor view */
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Prepare this appliance so repairs are faster when you need them
            </h1>

            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-3">
                <span className="text-blue-600 text-xl">✓</span>
                <span className="text-gray-700">Faster repair turnaround</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 text-xl">✓</span>
                <span className="text-gray-700">Fewer repeat visits</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-600 text-xl">✓</span>
                <span className="text-gray-700">Technician arrives prepared</span>
              </li>
            </ul>

            <Button fullWidth onClick={handleStart}>
              Get Started
            </Button>

            <p className="text-xs text-gray-500 text-center mt-4">
              No account required. Takes about 2 minutes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
