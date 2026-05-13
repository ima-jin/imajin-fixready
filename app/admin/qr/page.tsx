'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Select } from '@/components/select';
import type { Partner, RegistrationToken } from '@/db/schema';

interface TokenWithPartner extends RegistrationToken {
  partner: Partner | null;
}

export default function QRGeneratorPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [tokens, setTokens] = useState<TokenWithPartner[]>([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState('');
  const [label, setLabel] = useState('');
  const [token, setToken] = useState('');
  const [qrUrl, setQrUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchPartners = useCallback(async () => {
    try {
      const res = await fetch('/api/partners');
      if (!res.ok) throw new Error('Failed to fetch partners');
      const data = await res.json();
      setPartners(data);
    } catch (err) {
      console.error('Error fetching partners:', err);
      setError('Failed to load partners');
    }
  }, []);

  const fetchTokens = useCallback(async () => {
    try {
      const res = await fetch('/api/tokens');
      if (!res.ok) throw new Error('Failed to fetch tokens');
      const data = await res.json();
      setTokens(data);
    } catch (err) {
      console.error('Error fetching tokens:', err);
    }
  }, []);

  useEffect(() => {
    fetchPartners();
    fetchTokens();
  }, [fetchPartners, fetchTokens]);

  const generateToken = async () => {
    if (!selectedPartnerId) {
      setError('Please select a partner');
      return;
    }

    setLoading(true);
    setError('');
    setToken('');
    setQrUrl('');

    try {
      const res = await fetch('/api/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partnerId: selectedPartnerId,
          label: label || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create token');
      }

      const data: RegistrationToken = await res.json();
      setToken(data.id);
      setQrUrl(`/api/qr/generate?token=${data.id}`);
      await fetchTokens();
    } catch (err: any) {
      console.error('Error generating token:', err);
      setError(err.message || 'Failed to generate token');
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = () => {
    if (qrUrl) {
      const link = document.createElement('a');
      link.href = qrUrl;
      link.download = `qr-${token}.png`;
      link.click();
    }
  };

  const partnerOptions = partners.map((p) => ({
    value: p.id,
    label: p.name,
  }));

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        QR Code Generator
      </h1>

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <div>
          <p className="text-gray-600 mb-4">
            Generate QR codes for appliance registration. Each QR code links to a unique token.
          </p>
        </div>

        <div className="space-y-4">
          <Select
            label="Partner"
            options={partnerOptions}
            value={selectedPartnerId}
            onChange={(e) => setSelectedPartnerId(e.target.value)}
            required
          />

          <Input
            label="Label (optional)"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Kitchen appliances, Unit 4B"
          />

          <Button
            onClick={generateToken}
            disabled={loading || !selectedPartnerId}
            fullWidth
          >
            {loading ? 'Generating...' : 'Generate Token'}
          </Button>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          {token && qrUrl && (
            <div className="border-t pt-6">
              <div className="text-center">
                <img
                  src={qrUrl}
                  alt="QR Code"
                  className="mx-auto mb-4 border-2 border-gray-200 rounded"
                />
                <p className="text-sm text-gray-600 mb-2">
                  Token: <code className="bg-gray-100 px-1 rounded">{token}</code>
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Scan URL: {process.env.NEXT_PUBLIC_BASE_URL || 'https://fixready.imajin.ai'}/go/{token}
                </p>
                <Button onClick={downloadQR} variant="secondary">
                  Download QR Code
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-gray-700">
          <p className="font-medium mb-1">Usage:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Select a partner</li>
            <li>Optionally add a label</li>
            <li>Generate the token</li>
            <li>Download and print the QR code</li>
            <li>Customers scan to register their appliances</li>
          </ol>
        </div>
      </div>

      {tokens.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Existing Tokens ({tokens.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 font-medium text-gray-600">Token</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-600">Partner</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-600">Label</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-600">Scans</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-600">Created</th>
                </tr>
              </thead>
              <tbody>
                {tokens.map((t) => (
                  <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 px-3 font-mono text-xs">{t.id}</td>
                    <td className="py-2 px-3">{t.partner?.name || '—'}</td>
                    <td className="py-2 px-3 text-gray-600">{t.label || '—'}</td>
                    <td className="py-2 px-3">{t.scans ?? 0}</td>
                    <td className="py-2 px-3 text-gray-500">
                      {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
