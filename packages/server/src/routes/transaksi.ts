import { Router, Request, Response } from "express";
import { db } from "../db/index.js";
import { transaksi, projects, users, thresholds, notificationConfigs, notifications } from "../db/schema.js";
import { eq, sql } from "drizzle-orm";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();
router.use(authenticate);

// EWS level calculation
function getEwsLevel(percent: number): string | null {
  if (percent > 100) return "overrun";
  if (percent >= 95) return "kritis";
  if (percent >= 85) return "bahaya";
  if (percent >= 70) return "waspada";
  return null;
}

// GET /api/transaksi — list all, filtered by role
router.get("/", async (req: Request, res: Response) => {
  const { projectId } = req.query;
  let query = db.select().from(transaksi);

  if (req.user?.role === "site_manager") {
    const [user] = await db.select().from(users).where(eq(users.id, req.user.userId)).limit(1);
    if (user?.projectId) query = query.where(eq(transaksi.projectId, user.projectId));
    else { res.json([]); return; }
  }

  if (projectId) query = query.where(eq(transaksi.projectId, parseInt(projectId as string)));

  const list = await query;

  const enriched = [];
  for (const t of list) {
    const [project] = await db.select({ name: projects.name }).from(projects).where(eq(projects.id, t.projectId)).limit(1);
    const [finance] = t.financeId ? await db.select({ name: users.name }).from(users).where(eq(users.id, t.financeId)).limit(1) : [null];
    enriched.push({ ...t, projectName: project?.name, financeName: finance?.name });
  }

  res.json(enriched);
});

// POST /api/transaksi — create new transaction (owner & finance)
// This auto-updates projects.realisasi
router.post("/", authorize("owner", "finance"), async (req: Request, res: Response) => {
  const { projectId, pengajuanId, type, amount, date, vendor, category, description } = req.body;
  if (!projectId || !type || !amount || !date || !category || !description) {
    res.status(400).json({ message: "Proyek, tipe, jumlah, tanggal, kategori, dan deskripsi wajib diisi" }); return;
  }

  const [result] = await db.insert(transaksi).values({
    projectId,
    pengajuanId: pengajuanId || null,
    type,
    amount: Math.round(amount),
    date,
    vendor: vendor || null,
    category,
    description,
    financeId: req.user!.userId,
  }).returning();

  // Auto-update project realisasi
  const [sumResult] = await db.select({ total: sql<number>`COALESCE(SUM(amount), 0)` })
    .from(transaksi)
    .where(eq(transaksi.projectId, projectId))
    .limit(1);

  await db.update(projects)
    .set({ realisasi: sumResult?.total || 0 })
    .where(eq(projects.id, projectId));

  // EWS trigger — check thresholds and create notifications
  const [project] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
  if (project && project.budgetValue > 0) {
    const percent = Math.round((project.realisasi / project.budgetValue) * 100);
    const newLevel = getEwsLevel(percent);

    if (newLevel) {
      // Get custom thresholds
      const thresholdRows = await db.select().from(thresholds)
        .where(eq(thresholds.projectId, projectId));

      let thresholdPct: Record<string, number> = { waspada: 70, bahaya: 85, kritis: 95 };
      for (const t of thresholdRows) thresholdPct[t.level] = t.percent;

      // Check if level matches threshold
      let matchedLevel: string | null = null;
      if (newLevel === "overrun") matchedLevel = "overrun";
      else if (newLevel === "kritis" && percent >= thresholdPct.kritis) matchedLevel = "kritis";
      else if (newLevel === "bahaya" && percent >= thresholdPct.bahaya) matchedLevel = "bahaya";
      else if (newLevel === "waspada" && percent >= thresholdPct.waspada) matchedLevel = "waspada";

      if (matchedLevel) {
        // Get notification config
        const [config] = await db.select().from(notificationConfigs)
          .where(eq(notificationConfigs.projectId, projectId))
          .limit(1);

        const labels: Record<string, string> = { waspada: "Waspada", bahaya: "Bahaya", kritis: "Kritis", overrun: "Overrun" };
        const msg = `Proyek "${project.name}" mencapai level ${labels[matchedLevel]} (${percent}%)`;

        const recipients: number[] = [];
        if (!config || config.notifyOwner) {
          const [owner] = await db.select().from(users).where(eq(users.role, "owner")).limit(1);
          if (owner) recipients.push(owner.id);
        }
        if (config?.notifyFinance) {
          const [finance] = await db.select().from(users).where(eq(users.role, "finance")).limit(1);
          if (finance) recipients.push(finance.id);
        }
        if (config?.notifySm && project.siteManagerId) {
          recipients.push(project.siteManagerId);
        }

        for (const uid of recipients) {
          await db.insert(notifications).values({
            projectId, userId: uid, level: matchedLevel, message: msg,
          });
        }

        // Add notification info to response
        (result as any).ewAlert = { level: matchedLevel, percent, message: msg, notifiedUsers: recipients.length };
      }
    }
  }

  res.status(201).json(result);
});

// GET /api/transaksi/:id
router.get("/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const [t] = await db.select().from(transaksi).where(eq(transaksi.id, id)).limit(1);
  if (!t) { res.status(404).json({ message: "Transaksi tidak ditemukan" }); return; }
  res.json(t);
});

export default router;
