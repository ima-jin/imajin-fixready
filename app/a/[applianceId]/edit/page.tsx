'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Select } from '@/components/select';

const COMMON_BRANDS = [
  'LG', 'Samsung', 'Whirlpool', 'GE', 'Frigidaire', 'Maytag',
  'KitchenAid', 'Bosch', 'Electrolux', 'Kenmore', 'Other',
];

const AGE_RANGES = [
  { value: '<5', label: 'Less than 5 years' },
  { value: '5-10', label: '5-10 years' },
  { value: '10+', label: 'More than 10 years' },
];

const ROOMS = [
  { value: 'Kitchen', label: 'Kitchen' },
  { value: 'Laundry', label: 'Laundry Room' },
  { value: 'Basement', label: 'Basement' },
  { value: 'Garage', label: 'Garage' },
  { value: 'Other', label: 'Other' },
];

export default function EditAppliancePage() {
  const params = useParams<{ applianceId: string }>();
  const router = useRouter();
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [serial, setSerial] = useState('');
  const [ageRange, setAgeRange] = useState('');
  const [room, setRoom] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadAppliance() {
      if (!params.applianceId) return;
      try {
        const response = await fetch(`/api/appliances/${params.applianceId}`);
        if (!response.ok) {
          throw new Error('Appliance not found');
        }
        const data = await response.json();
        setBrand(data.brand || '');
        setModel(data.model || '');
        setSerial(data.serial || '');
        setAgeRange(data.ageRange || '');
        setRoom(data.room || '');
      } catch (error) {
        console.error('Error loading appliance:', error);
        router.push(`/a/${params.applianceId}`);
      } finally {
        setLoading(false);
      }
    }

    loadAppliance();
  }, [params.applianceId, router]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/appliances/${params.applianceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand,
          model,
          serial,
          ageRange,
          room,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save changes');
      }

      router.push(`/a/${params.applianceId}`);
    } catch (error) {
      console.error('Error saving appliance:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push(`/a/${params.applianceId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Edit Appliance
        </h1>

        <div className="space-y-4 mb-6">
          <Select
            label="Brand"
            required
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            options={COMMON_BRANDS.map((b) => ({ value: b, label: b }))}
          />

          <Input
            label="Model Number"
            required
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="e.g., WM3500CW"
          />

          <Input
            label="Serial Number"
            value={serial}
            onChange={(e) => setSerial(e.target.value)}
            placeholder="e.g., 12345ABC"
          />

          <Select
            label="Approximate Age"
            required
            value={ageRange}
            onChange={(e) => setAgeRange(e.target.value)}
            options={AGE_RANGES}
          />

          <Select
            label="Room / Location"
            required
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            options={ROOMS}
          />
        </div>

        <div className="space-y-3">
          <Button fullWidth onClick={handleSave} disabled={!brand || !model || !ageRange || !room || saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button fullWidth variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
