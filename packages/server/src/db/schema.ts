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
