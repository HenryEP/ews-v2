import { pgTable, serial, text, integer, boolean, pgEnum, timestamp } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["owner", "finance", "site_manager"]);
export const projectTypeEnum = pgEnum("project_type", ["pengadaan", "konstruksi", "jasa", "jasa_perbaikan", "lainnya"]);
export const budgetTypeEnum = pgEnum("budget_type", ["rab", "percent"]);
export const projectStatusEnum = pgEnum("project_status", ["aktif", "selesai", "ditunda", "dibatalkan"]);
export const categoryEnum = pgEnum("category", ["material", "jasa", "alat", "lainnya"]);
export const pengajuanStatusEnum = pgEnum("pengajuan_status", ["menunggu", "disetujui", "ditolak"]);
export const transaksiTypeEnum = pgEnum("transaksi_type", ["po", "invoice", "bon", "tanpa_dokumen"]);
export const thresholdLevelEnum = pgEnum("threshold_level", ["waspada", "bahaya", "kritis"]);
export const notifConfigLevelEnum = pgEnum("notif_config_level", ["waspada", "bahaya", "kritis", "overrun"]);
export const notifLevelEnum = pgEnum("notif_level", ["waspada", "bahaya", "kritis", "overrun"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: roleEnum("role").notNull(),
  projectId: integer("project_id"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: projectTypeEnum("type").notNull(),
  poValue: integer("po_value").notNull(),
  budgetType: budgetTypeEnum("budget_type").notNull(),
  budgetPercent: integer("budget_percent"),
  budgetValue: integer("budget_value").notNull(),
  realisasi: integer("realisasi").default(0),
  siteManagerId: integer("site_manager_id").references(() => users.id),
  status: projectStatusEnum("status").default("aktif"),
  startDate: text("start_date").notNull(),
  endDate: text("end_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const pengajuan = pgTable("pengajuan", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  siteManagerId: integer("site_manager_id").references(() => users.id).notNull(),
  description: text("description").notNull(),
  estimatedCost: integer("estimated_cost").notNull(),
  category: categoryEnum("category").notNull(),
  notes: text("notes"),
  status: pengajuanStatusEnum("status").default("menunggu"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const transaksi = pgTable("transaksi", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  pengajuanId: integer("pengajuan_id").references(() => pengajuan.id),
  type: transaksiTypeEnum("type").notNull(),
  amount: integer("amount").notNull(),
  date: text("date").notNull(),
  vendor: text("vendor"),
  category: categoryEnum("category").notNull(),
  description: text("description").notNull(),
  approvedByOwner: boolean("approved_by_owner").default(false),
  financeId: integer("finance_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const thresholds = pgTable("thresholds", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  level: thresholdLevelEnum("level").notNull(),
  percent: integer("percent").notNull(),
});

export const notificationConfigs = pgTable("notification_configs", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  level: notifConfigLevelEnum("level").notNull(),
  notifyOwner: boolean("notify_owner").default(true),
  notifyFinance: boolean("notify_finance").default(true),
  notifySm: boolean("notify_sm").default(false),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  level: notifLevelEnum("level").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});
