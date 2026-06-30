import { Router, Request, Response } from "express";
import { db } from "../db/index.js";
import { pengajuan, projects, users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();
router.use(authenticate);

// GET /api/pengajuan — list, filtered by role
router.get("/", async (req: Request, res: Response) => {
  let query = db.select().from(pengajuan);

  if (req.user?.role === "site_manager") {
    const [user] = await db.select().from(users).where(eq(users.id, req.user.userId)).limit(1);
    if (user?.projectId) {
      query = query.where(eq(pengajuan.projectId, user.projectId));
    } else { res.json([]); return; }
  }

  const list = await query;

  const enriched = [];
  for (const p of list) {
    const [project] = await db.select({ name: projects.name }).from(projects).where(eq(projects.id, p.projectId)).limit(1);
    const [sm] = await db.select({ name: users.name }).from(users).where(eq(users.id, p.siteManagerId)).limit(1);
    enriched.push({ ...p, projectName: project?.name, siteManagerName: sm?.name });
  }

  res.json(enriched);
});

// POST /api/pengajuan — site manager creates submission
router.post("/", authorize("owner", "finance", "site_manager"), async (req: Request, res: Response) => {
  const { projectId, description, estimatedCost, category, notes } = req.body;
  if (!projectId || !description || !estimatedCost || !category) {
    res.status(400).json({ message: "Proyek, deskripsi, estimasi, dan kategori wajib diisi" }); return;
  }

  const smId = req.user?.role === "site_manager" ? req.user.userId : req.body.siteManagerId;
  if (!smId) { res.status(400).json({ message: "Site Manager harus ditentukan" }); return; }

  const [result] = await db.insert(pengajuan).values({
    projectId, siteManagerId: smId, description, estimatedCost, category, notes: notes || null,
  }).returning();

  res.status(201).json(result);
});

// PUT /api/pengajuan/:id — update status (approve/reject)
router.put("/:id", authorize("owner", "finance"), async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const { status } = req.body;
  if (!status || !["menunggu", "disetujui", "ditolak"].includes(status)) {
    res.status(400).json({ message: "Status tidak valid" }); return;
  }

  const [existing] = await db.select().from(pengajuan).where(eq(pengajuan.id, id)).limit(1);
  if (!existing) { res.status(404).json({ message: "Pengajuan tidak ditemukan" }); return; }

  const [updated] = await db.update(pengajuan).set({ status }).where(eq(pengajuan.id, id)).returning();
  res.json(updated);
});

export default router;
