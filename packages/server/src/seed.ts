import "dotenv/config";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { users } from "./db/schema.js";
import bcrypt from "bcryptjs";
import * as schema from "./db/schema.js";

async function main() {
  const client = createClient({ url: "file:ews.db" });
  const db = drizzle(client, { schema });

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

  const existingUsers = db.select().from(users).all();
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
    db.insert(users).values(user).run();
  }

  console.log("Database seeded with 5 users");
}

main().catch(console.error);
