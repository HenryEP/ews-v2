import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role", { enum: ["owner", "finance", "site_manager"] }).notNull(),
  projectId: integer("project_id"),
  isActive: integer("is_active").default(1),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

export const projects = sqliteTable("projects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  type: text("type", { enum: ["pengadaan", "konstruksi", "jasa", "jasa_perbaikan", "lainnya"] }).notNull(),
  poValue: integer("po_value").notNull(),
  budgetType: text("budget_type", { enum: ["rab", "percent"] }).notNull(),
  budgetPercent: integer("budget_percent"),
  budgetValue: integer("budget_value").notNull(),
  siteManagerId: integer("site_manager_id").references(() => users.id),
  status: text("status", { enum: ["aktif", "selesai", "ditunda", "dibatalkan"] }).default("aktif"),
  startDate: text("start_date").notNull(),
  endDate: text("end_date"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});
