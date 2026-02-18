# FixReady

Appliance service request platform MVP.

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.local.example .env.local
# Edit .env.local with your DATABASE_URL

# Push database schema
npm run db:push

# Seed demo data
npx tsx scripts/seed.ts

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon Postgres connection string |
| `NEXT_PUBLIC_BASE_URL` | Base URL for the app (e.g., `http://localhost:3000`) |

## Features

- **Homeowner Registration** (`/go/{token}`) — QR code triggered appliance registration
- **Service Requests** (`/a/{applianceId}`) — Symptom-based service request flow
- **Admin Dashboard** (`/admin/requests`) — Dispatcher queue and request details
- **Tech Job View** (`/job/{jobId}`) — Mobile-optimized technician interface
- **QR Code Generator** (`/admin/qr`) — Generate registration QR codes

## Tech Stack

- Next.js 14 (App Router)
- Tailwind CSS
- Drizzle ORM + Neon Postgres
- TypeScript

## Documentation

See `IMPLEMENTATION_COMPLETE.md` for full implementation details.
