'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/button';
import { ApplianceCard } from '@/components/appliance-card';

interface ServiceRequest {
  id: string;
  applianceId: string;
  symptomCategory: string;
  status: 'new' | 'in_progress' | 'resolved' | 'cancelled';
  createdAt: string;
  appliance?: {
    type: string;
    brand: string | null;
    model: string | null;
  };
}

const STATUS_BADGES: Record<string, { label: string; color: string; dot: string }> = {
  new: { label: 'New', color: 'bg-blue-50 text-blue-700 border-blue-200', dot: '🔵' },
  in_progress: { label: 'In Progress', color: 'bg-yellow-50 text-yellow-700 border-yellow-200', dot: '🟡' },
  resolved: { label: 'Resolved', color: 'bg-green-50 text-green-700 border-green-200', dot: '🟢' },
  cancelled: { label: 'Cancelled', color: 'bg-gray-50 text-gray-600 border-gray-200', dot: '⚪' },
};

const SYMPTOM_LABELS: Record<string, Record<string, string>> = {
  washer: {
    not_draining: "Won't drain / water stays in drum",
    not_spinning: "Won't spin",
    leaking: 'Leaking water',
    noisy: 'Making unusual noises',
    wont_start: "Won't start at all",
    other: 'Something else',
  },
  dryer: {
    not_heating: 'Not heating / clothes stay wet',
    wont_start: "Won't start at all",
    noisy: 'Making loud noises',
    overheating: 'Getting too hot / burning smell',
    takes_too_long: 'Takes forever to dry',
    other: 'Something else',
  },
  fridge: {
    not_cooling: 'Not cooling / too warm',
    leaking_water: 'Leaking water',
    noisy: 'Making loud or unusual noises',
    ice_maker_problem: 'Ice maker not working',
    too_cold_freezing: 'Too cold / freezing food',
    other: 'Something else',
  },
  dishwasher: {
    not_cleaning: 'Not cleaning dishes properly',
    not_draining: 'Not draining / water in bottom',
    leaking: 'Leaking water',
    not_filling: 'Not filling with water',
    noisy: 'Making loud or unusual noises',
    wont_start: "Won't start at all",
    other: 'Something else',
  },
};

function getSymptomLabel(type: string, category: string): string {
  return SYMPTOM_LABELS[type]?.[category] || category.replace(/_/g, ' ');
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function ApplianceDetailPage() {
  const params = useParams<{ applianceId: string }>();
  const router = useRouter();
  const [appliance, setAppliance] = useState<any>(null);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!params.applianceId) return;
      try {
        const [applianceRes, requestsRes] = await Promise.all([
          fetch(`/api/appliances/${params.applianceId}`),
          fetch(`/api/requests?applianceId=${params.applianceId}`),
        ]);

        if (applianceRes.ok) {
          setAppliance(await applianceRes.json());
        }

        if (requestsRes.ok) {
          setRequests(await requestsRes.json());
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [params.applianceId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!appliance) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Appliance Not Found
          </h1>
          <p className="text-gray-600">
            This appliance hasn&apos;t been registered yet. Please register it first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Appliance Details
        </h1>

        <ApplianceCard
          appliance={appliance}
          location={appliance.location}
          className="mb-6"
        />

        <div className="space-y-3 mb-8">
          <Button
            fullWidth
            onClick={() => router.push(`/a/${params.applianceId}/symptoms`)}
          >
            Report a Problem
          </Button>
          <Button
            fullWidth
            variant="outline"
            onClick={() => router.push(`/a/${params.applianceId}/edit`)}
          >
            Edit Details
          </Button>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Service History
          </h2>

          {requests.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
              <p className="text-gray-500">No service requests yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => {
                const badge = STATUS_BADGES[req.status] || STATUS_BADGES.new;
                return (
                  <div
                    key={req.id}
                    className="bg-white rounded-lg border border-gray-200 p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500">
                        {formatDate(req.createdAt)}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${badge.color}`}
                      >
                        <span>{badge.dot}</span>
                        {badge.label}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {getSymptomLabel(appliance.type, req.symptomCategory)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
