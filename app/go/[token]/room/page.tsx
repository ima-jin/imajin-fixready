'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/button';
import { Select } from '@/components/select';

const ROOMS = [
  { value: 'Kitchen', label: 'Kitchen' },
  { value: 'Laundry', label: 'Laundry Room' },
  { value: 'Basement', label: 'Basement' },
  { value: 'Garage', label: 'Garage' },
  { value: 'Other', label: 'Other' },
];

export default function RoomPage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const [room, setRoom] = useState('');
  const [saving, setSaving] = useState(false);
  const [partnerData, setPartnerData] = useState<any>(null);

  useEffect(() => {
    async function loadTokenData() {
      if (!params.token) return;
      const response = await fetch(`/api/token/${params.token}`);
      const data = await response.json();
      setPartnerData(data);

      // Verify we have required session data
      const locationId = sessionStorage.getItem('location_id');
      const type = sessionStorage.getItem('appliance_type');
      const brand = sessionStorage.getItem('appliance_brand');
      const model = sessionStorage.getItem('appliance_model');
      const ageRange = sessionStorage.getItem('appliance_age_range');

      if (!locationId || !type || !brand || !model || !ageRange) {
        // Missing data, redirect back to start
        router.push(`/go/${params.token}`);
      }
    }
    loadTokenData();
  }, [params.token, router]);

  const handleSave = async () => {
    setSaving(true);

    try {
      const applianceData = {
        partnerId: partnerData?.partner?.id,
        tokenId: params.token,
        locationId: sessionStorage.getItem('location_id'),
        type: sessionStorage.getItem('appliance_type'),
        brand: sessionStorage.getItem('appliance_brand'),
        model: sessionStorage.getItem('appliance_model'),
        serial: sessionStorage.getItem('appliance_serial') || null,
        ageRange: sessionStorage.getItem('appliance_age_range'),
        room,
      };

      const response = await fetch('/api/appliances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(applianceData),
      });

      if (!response.ok) {
        throw new Error('Failed to save appliance');
      }

      const appliance = await response.json();

      // Clear appliance-specific session storage but keep contact/location
      sessionStorage.removeItem('appliance_type');
      sessionStorage.removeItem('appliance_brand');
      sessionStorage.removeItem('appliance_model');
      sessionStorage.removeItem('appliance_serial');
      sessionStorage.removeItem('appliance_age_range');

      router.push(`/go/${params.token}/done?applianceId=${appliance.id}`);
    } catch (error) {
      console.error('Error saving appliance:', error);
      alert('Failed to save appliance. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Which Room?
        </h1>

        <div className="space-y-4 mb-6">
          <Select
            label="Room / Location"
            required
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            options={ROOMS}
          />
        </div>

        <Button
          fullWidth
          onClick={handleSave}
          disabled={!room || saving}
        >
          {saving ? 'Saving...' : 'Save Appliance'}
        </Button>
      </div>
    </div>
  );
}
