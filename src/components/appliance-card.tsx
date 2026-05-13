import Link from 'next/link';
import type { Appliance } from '@/db/schema';

interface ApplianceCardProps {
  appliance: Appliance;
  location?: {
    address: string;
    unit?: string | null;
  } | null;
  className?: string;
  href?: string;
}

export function ApplianceCard({ appliance, location, className = '', href }: ApplianceCardProps) {
  const content = (
    <div className={`bg-white rounded-lg border-2 border-gray-200 p-4 transition-all ${className}`}>
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <div className="text-sm text-gray-500 uppercase tracking-wide">
            {appliance.type}
          </div>
          <div className="mt-1 text-lg font-semibold">
            {appliance.brand || 'Unknown Brand'}
          </div>
          {appliance.model && (
            <div className="text-sm text-gray-600">Model: {appliance.model}</div>
          )}
          {appliance.serial && (
            <div className="text-xs text-gray-500 mt-1">S/N: {appliance.serial}</div>
          )}
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-gray-100">
        {location && (
          <div className="text-sm text-gray-600 mb-1">
            📍 {location.address}
            {location.unit && ` - ${location.unit}`}
          </div>
        )}
        {appliance.room && (
          <div className="text-xs text-gray-500">
            Room: {appliance.room}
          </div>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block rounded-lg transition-all hover:border-blue-400 active:scale-[0.98] [&>div]:hover:border-blue-400 [&>div]:active:scale-[0.99]"
      >
        {content}
      </Link>
    );
  }

  return content;
}
