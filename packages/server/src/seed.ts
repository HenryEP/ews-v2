import "dotenv/config";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { users, projects, pengajuan, transaksi, thresholds, notificationConfigs, notifications } from "./db/schema.js";
import bcrypt from "bcryptjs";
import * as schema from "./db/schema.js";

async function main() {
  const client = createClient({ url: "file:ews.db" });
  const db = drizzle(client, { schema });

  // Add realisasi column if not exists (for existing databases)
  try {
    await client.execute("ALTER TABLE projects ADD COLUMN realisasi INTEGER DEFAULT 0");
  } catch (_) { /* column already exists */ }

  await client.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('owner','finance','site_manager')),
      project_id INTEGER,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('pengadaan','konstruksi','jasa','jasa_perbaikan','lainnya')),
      po_value INTEGER NOT NULL,
      budget_type TEXT NOT NULL CHECK(budget_type IN ('rab','percent')),
      budget_percent INTEGER,
      budget_value INTEGER NOT NULL,
      realisasi INTEGER DEFAULT 0,
      site_manager_id INTEGER REFERENCES users(id),
      status TEXT DEFAULT 'aktif' CHECK(status IN ('aktif','selesai','ditunda','dibatalkan')),
      start_date TEXT NOT NULL,
      end_date TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS pengajuan (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL REFERENCES projects(id),
      site_manager_id INTEGER NOT NULL REFERENCES users(id),
      description TEXT NOT NULL,
      estimated_cost INTEGER NOT NULL,
      category TEXT NOT NULL CHECK(category IN ('material','jasa','alat','lainnya')),
      notes TEXT,
      status TEXT DEFAULT 'menunggu' CHECK(status IN ('menunggu','disetujui','ditolak')),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS transaksi (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL REFERENCES projects(id),
      pengajuan_id INTEGER REFERENCES pengajuan(id),
      type TEXT NOT NULL CHECK(type IN ('po','invoice','bon','tanpa_dokumen')),
      amount INTEGER NOT NULL,
      date TEXT NOT NULL,
      vendor TEXT,
      category TEXT NOT NULL CHECK(category IN ('material','jasa','alat','lainnya')),
      description TEXT NOT NULL,
      approved_by_owner INTEGER DEFAULT 0,
      finance_id INTEGER REFERENCES users(id),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await client.execute(`CREATE TABLE IF NOT EXISTS thresholds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL REFERENCES projects(id),
    level TEXT NOT NULL CHECK(level IN ('waspada','bahaya','kritis')),
    percent INTEGER NOT NULL
  );`);

  await client.execute(`CREATE TABLE IF NOT EXISTS notification_configs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL REFERENCES projects(id),
    level TEXT NOT NULL CHECK(level IN ('waspada','bahaya','kritis','overrun')),
    notify_owner INTEGER DEFAULT 1,
    notify_finance INTEGER DEFAULT 1,
    notify_sm INTEGER DEFAULT 0
  );`);

  await client.execute(`CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL REFERENCES projects(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    level TEXT NOT NULL CHECK(level IN ('waspada','bahaya','kritis','overrun')),
    message TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );`);

  const existingUsers = await db.select().from(users).all();
  if (existingUsers.length > 0) {
    console.log("Database already seeded, skipping...");
    return;
  }

  const hashedPassword = await bcrypt.hash("password123", 10);

  const seedData = [
    { email: "owner@ews.com", password: hashedPassword, name: "Ahmad Wijaya", role: "owner" as const },
    { email: "finance@ews.com", password: hashedPassword, name: "Siti Rahayu", role: "finance" as const },
    { email: "sm1@ews.com", password: hashedPassword, name: "Budi Santoso", role: "site_manager" as const, projectId: 1 },
    { email: "sm2@ews.com", password: hashedPassword, name: "Dewi Lestari", role: "site_manager" as const, projectId: 2 },
    { email: "sm3@ews.com", password: hashedPassword, name: "Eko Prasetyo", role: "site_manager" as const, projectId: 3 },
  ];

  for (const user of seedData) {
    await db.insert(users).values(user).run();
  }

  console.log("Database seeded with 5 users");

  const existingProjects = await db.select().from(projects).all();
  if (existingProjects.length === 0) {
    const projectData = [
      { name: "Pengadaan Spare Part Turbin A", type: "pengadaan" as const, poValue: 500000000, budgetType: "percent" as const, budgetPercent: 65, budgetValue: 325000000, siteManagerId: 3, status: "aktif" as const, startDate: "2025-01-15", endDate: "2025-08-30", realisasi: 295750000 },
      { name: "Pembangunan Gedung Kantor B", type: "konstruksi" as const, poValue: 2000000000, budgetType: "rab" as const, budgetPercent: null, budgetValue: 1850000000, siteManagerId: 4, status: "aktif" as const, startDate: "2025-02-01", endDate: "2025-12-31", realisasi: 1332000000 },
      { name: "Perbaikan Mesin Press C", type: "jasa_perbaikan" as const, poValue: 150000000, budgetType: "percent" as const, budgetPercent: 70, budgetValue: 105000000, siteManagerId: 5, status: "aktif" as const, startDate: "2025-03-10", endDate: "2025-07-15", realisasi: 57750000 },
      { name: "Renovasi Gudang D", type: "konstruksi" as const, poValue: 800000000, budgetType: "rab" as const, budgetPercent: null, budgetValue: 750000000, siteManagerId: 3, status: "aktif" as const, startDate: "2025-01-20", endDate: "2025-09-30", realisasi: 772500000 },
      { name: "Pengadaan Panel Listrik E", type: "pengadaan" as const, poValue: 300000000, budgetType: "percent" as const, budgetPercent: 68, budgetValue: 204000000, siteManagerId: 4, status: "aktif" as const, startDate: "2025-04-01", endDate: "2025-10-31", realisasi: 81600000 },
      { name: "Pemasangan CCTV Pabrik F", type: "pengadaan" as const, poValue: 120000000, budgetType: "percent" as const, budgetPercent: 65, budgetValue: 78000000, siteManagerId: 5, status: "aktif" as const, startDate: "2025-04-15", endDate: "2025-08-30", realisasi: 68640000 },
      { name: "Pembangunan Pos Satpam G", type: "konstruksi" as const, poValue: 200000000, budgetType: "rab" as const, budgetPercent: null, budgetValue: 190000000, siteManagerId: 3, status: "aktif" as const, startDate: "2025-05-01", endDate: "2025-09-30", realisasi: 114000000 },
      { name: "Jasa Kalibrasi Alat Ukur H", type: "jasa" as const, poValue: 80000000, budgetType: "percent" as const, budgetPercent: 70, budgetValue: 56000000, siteManagerId: 4, status: "aktif" as const, startDate: "2025-05-15", endDate: "2025-07-30", realisasi: 53200000 },
      { name: "Pengadaan Genset Cadangan I", type: "pengadaan" as const, poValue: 450000000, budgetType: "percent" as const, budgetPercent: 65, budgetValue: 292500000, siteManagerId: 5, status: "aktif" as const, startDate: "2025-02-15", endDate: "2025-11-30", realisasi: 228150000 },
      { name: "Renovasi Toilet Kantor J", type: "konstruksi" as const, poValue: 150000000, budgetType: "rab" as const, budgetPercent: null, budgetValue: 140000000, siteManagerId: 3, status: "aktif" as const, startDate: "2025-06-01", endDate: "2025-08-30", realisasi: 70000000 },
      { name: "Jasa Cleaning Service K", type: "jasa" as const, poValue: 60000000, budgetType: "percent" as const, budgetPercent: 80, budgetValue: 48000000, siteManagerId: 4, status: "aktif" as const, startDate: "2025-01-01", endDate: "2025-12-31", realisasi: 50400000 },
      { name: "Pengadaan UPS Server L", type: "pengadaan" as const, poValue: 200000000, budgetType: "percent" as const, budgetPercent: 65, budgetValue: 130000000, siteManagerId: 5, status: "aktif" as const, startDate: "2025-03-01", endDate: "2025-09-30", realisasi: 106600000 },
      { name: "Perbaikan Atap Gudang M", type: "konstruksi" as const, poValue: 350000000, budgetType: "rab" as const, budgetPercent: null, budgetValue: 320000000, siteManagerId: 3, status: "aktif" as const, startDate: "2025-06-15", endDate: "2025-11-30", realisasi: 144000000 },
      { name: "Jasa Pest Control N", type: "jasa" as const, poValue: 40000000, budgetType: "percent" as const, budgetPercent: 75, budgetValue: 30000000, siteManagerId: 4, status: "aktif" as const, startDate: "2025-04-01", endDate: "2025-10-31", realisasi: 21000000 },
      { name: "Pengadaan Peralatan K3 O", type: "pengadaan" as const, poValue: 100000000, budgetType: "percent" as const, budgetPercent: 70, budgetValue: 70000000, siteManagerId: 5, status: "aktif" as const, startDate: "2025-05-01", endDate: "2025-08-30", realisasi: 45500000 },
    ];

    for (const p of projectData) {
      await db.insert(projects).values(p).run();
    }
    console.log("Database seeded with 15 projects");
  }
}

main().catch(console.error);
