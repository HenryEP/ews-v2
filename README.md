# EWS - Early Warning System
Sistem Pemantauan Anggaran Proyek Kontraktor

## Tech Stack
- **Frontend**: React 19 + Vite 6 + Tailwind CSS 4 + TypeScript
- **Backend**: Express + TypeScript + Drizzle ORM + PostgreSQL
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel

## Setup Lokal

### Prasyarat
- Node.js v24+
- pnpm (`npm install -g pnpm`)
- PostgreSQL (atau Supabase)

### Install
```bash
pnpm install
```

### Konfigurasi
Copy `.env.example` ke `.env` di `packages/server/`:
```bash
cp packages/server/.env.example packages/server/.env
```
Isi `DATABASE_URL` dengan connection string Supabase PostgreSQL.

### Push Schema & Seed
```bash
cd packages/server
npx drizzle-kit push
pnpm exec tsx src/seed.ts
```

### Jalankan
```bash
# Terminal 1: Server (port 3001)
pnpm dev:server

# Terminal 2: Client (port 5173)
pnpm dev:client
```

Buka http://localhost:5173

### User Demo
| Email | Password | Role |
|---|---|---|
| owner@ews.com | password123 | Owner |
| finance@ews.com | password123 | Finance |
| sm1@ews.com | password123 | Site Manager |

## Fase Build
| Fase | Status |
|---|---|
| A — Fondasi & Autentikasi | ✅ |
| B — Manajemen Proyek | ✅ |
| C — Dashboard & EWS | ✅ |
| D — Alur Transaksi | ✅ |
| E — EWS Engine & Notifikasi | ✅ |
| F — Laporan & Export | ✅ |
