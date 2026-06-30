import { Router, Request, Response } from "express";
import { db } from "../db/index.js";
import { notifications, notificationConfigs, projects } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();
router.use(authenticate);

// GET /api/notifications — list notifications for current user
router.get("/", async (req: Request, res: Response) => {
  const list = await db.select().from(notifications)
    .where(eq(notifications.userId, req.user!.userId));

  const enriched = [];
  for (const n of list) {
    const [project] = await db.select({ name: projects.name }).from(projects).where(eq(projects.id, n.projectId)).limit(1);
    enriched.push({ ...n, projectName: project?.name || "Unknown" });
  }

  enriched.sort((a, b) => b.id - a.id);
  res.json(enriched);
});

// GET /api/notifications/unread-count — must be before /:id
router.get("/unread-count", async (req: Request, res: Response) => {
  const list = await db.select().from(notifications)
    .where(eq(notifications.userId, req.user!.userId));
  const count = list.filter((n) => !n.isRead).length;
  res.json({ count });
});

// PUT /api/notifications/read-all — must be before /:id
router.put("/read-all", async (req: Request, res: Response) => {
  await db.update(notifications).set({ isRead: true })
    .where(eq(notifications.userId, req.user!.userId));
  res.json({ success: true });
});

// POST /api/notifications/simulate — must be before /:id
router.post("/simulate", async (req: Request, res: Response) => {
  const { projectId, level, percent } = req.body;
  if (!projectId || !level || percent === undefined) {
    res.status(400).json({ message: "projectId, level, percent wajib" }); return;
  }

  const [project] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
  if (!project) { res.status(404).json({ message: "Proyek tidak ditemukan" }); return; }

  const labels: Record<string, string> = {
    waspada: "Waspada", bahaya: "Bahaya", kritis: "Kritis", overrun: "Overrun",
  };

  const waMessage = `⚠️ *EWS Alert: ${labels[level] || level}*\n\nProyek: *${project.name}*\nRealisasi: ${percent}% dari budget\nStatus: Anggaran telah mencapai level ${labels[level] || level}\n\nSegera tinjau proyek ini di aplikasi EWS.`;

  const emailSubject = `[EWS] ${labels[level] || level} - ${project.name}`;
  const emailBody = `<div style="font-family:sans-serif;max-width:600px;margin:auto;padding:20px;border:1px solid #ddd;border-radius:8px">
<h2 style="color:#d32f2f">⚠️ Early Warning System</h2>
<h3>Status: ${labels[level] || level}</h3>
<table style="width:100%;border-collapse:collapse">
<tr><td style="padding:8px;border-bottom:1px solid #eee"><strong>Proyek</strong></td><td style="padding:8px;border-bottom:1px solid #eee">${project.name}</td></tr>
<tr><td style="padding:8px;border-bottom:1px solid #eee"><strong>Budget</strong></td><td style="padding:8px;border-bottom:1px solid #eee">Rp ${project.budgetValue.toLocaleString("id-ID")}</td></tr>
<tr><td style="padding:8px;border-bottom:1px solid #eee"><strong>Realisasi</strong></td><td style="padding:8px;border-bottom:1px solid #eee">Rp ${project.realisasi.toLocaleString("id-ID")} (${percent}%)</td></tr>
<tr><td style="padding:8px;border-bottom:1px solid #eee"><strong>Sisa Anggaran</strong></td><td style="padding:8px;border-bottom:1px solid #eee">Rp ${(project.budgetValue - project.realisasi).toLocaleString("id-ID")}</td></tr>
</table>
<p style="margin-top:16px;color:#666">Segera tinjau proyek ini di aplikasi EWS.</p>
</div>`;

  res.json({ waMessage, emailSubject, emailBody });
});

// GET /api/notifications/config/:projectId — must be before /:id
router.get("/config/:projectId", async (req: Request, res: Response) => {
  const projectId = parseInt(req.params.projectId);
  const configs = await db.select().from(notificationConfigs)
    .where(eq(notificationConfigs.projectId, projectId));

  const levels = ["waspada", "bahaya", "kritis", "overrun"];
  const result = levels.map((level) => {
    const existing = configs.find((c) => c.level === level);
    return {
      level,
      notifyOwner: existing ? existing.notifyOwner : true,
      notifyFinance: existing ? existing.notifyFinance : true,
      notifySm: existing ? existing.notifySm : false,
    };
  });

  res.json(result);
});

// PUT /api/notifications/config/:projectId — must be before /:id
router.put("/config/:projectId", authorize("owner"), async (req: Request, res: Response) => {
  const projectId = parseInt(req.params.projectId);
  const { configs } = req.body;
  if (!Array.isArray(configs)) { res.status(400).json({ message: "configs harus array" }); return; }

  for (const c of configs) {
    const [existing] = await db.select().from(notificationConfigs)
      .where(eq(notificationConfigs.projectId, projectId))
      .limit(1);

    const data = {
      projectId,
      level: c.level,
      notifyOwner: !!c.notifyOwner,
      notifyFinance: !!c.notifyFinance,
      notifySm: !!c.notifySm,
    };

    if (existing) {
      await db.update(notificationConfigs).set(data).where(eq(notificationConfigs.id, existing.id));
    } else {
      await db.insert(notificationConfigs).values(data);
    }
  }

  res.json({ success: true });
});

// PUT /api/notifications/:id/read — mark as read
router.put("/:id/read", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
  res.json({ success: true });
});

export default router;
