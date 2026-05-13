'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/button';
import { Input } from '@/components/input';

export default function LocationPage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const [address, setAddress] = useState('');
  const [unit, setUnit] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function checkExistingLocation() {
      if (!params.token) return;
      const response = await fetch(`/api/locations?tokenId=${params.token}`);
      if (response.ok) {
        const location = await response.json();
        if (location?.id) {
          sessionStorage.setItem('location_id', location.id);
          router.push(`/go/${params.token}/type`);
        }
      }
    }
    checkExistingLocation();
  }, [params.token, router]);

  const handleSave = async () => {
    setSaving(true);

    try {
      const response = await fetch('/api/locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenId: params.token,
          address,
          unit: unit || null,
          city: city || null,
          province: province || null,
          postalCode: postalCode || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save location');
      }

      const location = await response.json();
      sessionStorage.setItem('location_id', location.id);

      router.push(`/go/${params.token}/type`);
    } catch (error) {
      console.error('Error saving location:', error);
      alert('Failed to save location. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const canSave = address.trim().length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Property Address
        </h1>
        <p className="text-gray-600 mb-6">
          This address will be used for all appliances at this location.
        </p>

        <div className="space-y-4 mb-6">
          <Input
            label="Street Address"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="123 Main St"
          />

          <Input
            label="Unit / Apt # (Optional)"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder="Apt 4B"
          />

          <Input
            label="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Toronto"
          />

          <Input
            label="Province / State"
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            placeholder="Ontario"
          />

          <Input
            label="Postal / ZIP Code"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            placeholder="M5V 1A1"
          />
        </div>

        <Button
          fullWidth
          onClick={handleSave}
          disabled={!canSave || saving}
        >
          {saving ? 'Saving...' : 'Continue'}
        </Button>
      </div>
    </div>
  );
}
