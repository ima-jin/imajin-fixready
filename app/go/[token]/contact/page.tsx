'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/button';
import { Input } from '@/components/input';

const ROLES = [
  { value: 'owner', label: 'Owner', description: 'I own this property' },
  { value: 'tenant', label: 'Tenant', description: 'I rent this property' },
  { value: 'service', label: 'Service Provider', description: 'Property manager, superintendent, etc.' },
  { value: 'other', label: 'Other', description: 'Something else' },
];

export default function ContactPage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [saving, setSaving] = useState(false);
  const [partnerData, setPartnerData] = useState<any>(null);

  useEffect(() => {
    async function loadTokenData() {
      if (!params.token) return;
      const response = await fetch(`/api/token/${params.token}`);
      const data = await response.json();
      setPartnerData(data);

      // If contact_id already in sessionStorage, skip to location
      const existingContactId = sessionStorage.getItem('contact_id');
      if (existingContactId) {
        if (data.location) {
          router.push(`/go/${params.token}/type`);
        } else {
          router.push(`/go/${params.token}/location`);
        }
      }
    }
    loadTokenData();
  }, [params.token, router]);

  const handleSave = async () => {
    setSaving(true);

    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenId: params.token,
          name: name || null,
          phone: phone || null,
          email: email || null,
          role,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save contact');
      }

      const contact = await response.json();
      sessionStorage.setItem('contact_id', contact.id);

      // If location already exists for this token, skip to type selection
      if (partnerData?.location) {
        router.push(`/go/${params.token}/type`);
      } else {
        router.push(`/go/${params.token}/location`);
      }
    } catch (error) {
      console.error('Error saving contact:', error);
      alert('Failed to save contact info. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const canSave = role && (phone || email);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Your Contact Info
        </h1>
        <p className="text-gray-600 mb-6">
          We&apos;ll use this to reach you if this appliance needs service.
        </p>

        <div className="space-y-4 mb-6">
          <Input
            label="Name (Optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Jane Smith"
          />

          <Input
            label="Phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(555) 123-4567"
          />

          <div className="my-2 text-center text-sm text-gray-500">or</div>

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />

          <div className="pt-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Role <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setRole(r.value)}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    role === r.value
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-gray-900">{r.label}</div>
                  <div className="text-sm text-gray-500">{r.description}</div>
                </button>
              ))}
            </div>
          </div>
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
