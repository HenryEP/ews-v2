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
  realisasi: integer("realisasi").default(0),
  siteManagerId: integer("site_manager_id").references(() => users.id),
  status: text("status", { enum: ["aktif", "selesai", "ditunda", "dibatalkan"] }).default("aktif"),
  startDate: text("start_date").notNull(),
  endDate: text("end_date"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

export const pengajuan = sqliteTable("pengajuan", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  siteManagerId: integer("site_manager_id").references(() => users.id).notNull(),
  description: text("description").notNull(),
  estimatedCost: integer("estimated_cost").notNull(),
  category: text("category", { enum: ["material", "jasa", "alat", "lainnya"] }).notNull(),
  notes: text("notes"),
  status: text("status", { enum: ["menunggu", "disetujui", "ditolak"] }).default("menunggu"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

export const transaksi = sqliteTable("transaksi", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  pengajuanId: integer("pengajuan_id").references(() => pengajuan.id),
  type: text("type", { enum: ["po", "invoice", "bon", "tanpa_dokumen"] }).notNull(),
  amount: integer("amount").notNull(),
  date: text("date").notNull(),
  vendor: text("vendor"),
  category: text("category", { enum: ["material", "jasa", "alat", "lainnya"] }).notNull(),
  description: text("description").notNull(),
  approvedByOwner: integer("approved_by_owner").default(0),
  financeId: integer("finance_id").references(() => users.id),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

export const thresholds = sqliteTable("thresholds", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  level: text("level", { enum: ["waspada", "bahaya", "kritis"] }).notNull(),
  percent: integer("percent").notNull(),
});

export const notificationConfigs = sqliteTable("notification_configs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  level: text("level", { enum: ["waspada", "bahaya", "kritis", "overrun"] }).notNull(),
  notifyOwner: integer("notify_owner").default(1),
  notifyFinance: integer("notify_finance").default(1),
  notifySm: integer("notify_sm").default(0),
});

export const notifications = sqliteTable("notifications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  level: text("level", { enum: ["waspada", "bahaya", "kritis", "overrun"] }).notNull(),
  message: text("message").notNull(),
  isRead: integer("is_read").default(0),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});
