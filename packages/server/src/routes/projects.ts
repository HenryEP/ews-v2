import { Router, Request, Response } from "express";
import { db } from "../db/index.js";
import { projects } from "../db/schema.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();
// All routes require authentication
router.use(authenticate);

// GET /api/projects/site-managers — must be BEFORE /:id to avoid matching "site-managers" as :id
router.get("/site-managers/list", async (_req: Request, res: Response) => {
  const sms = await db.select({ id: users.id, name: users.name, email: users.email })
    .from(users)
    .where(eq(users.role, "site_manager"))
    .all();
  res.json(sms);
});

// GET /api/projects — list projects with optional filters
// Query params: status, type, search (name)
// Owner & finance can see all; site_manager only sees their assigned project
router.get("/", async (req: Request, res: Response) => {
  const { status, type, search } = req.query;
  let query = db.select().from(projects);

  if (req.user!.role === "site_manager") {
    const user = await db.select().from(users).where(eq(users.id, req.user!.userId)).get();
    if (user?.projectId) {
      query = query.where(eq(projects.id, user.projectId));
    } else {
      res.json([]);
      return;
    }
  }

  if (status) query = query.where(eq(projects.status, status as string));
  if (type) query = query.where(eq(projects.type, type as string));

  const result = await query.all();

  // Include site manager name by joining
  const enriched = result.map((p) => {
    const sm = p.siteManagerId
      ? db.select({ name: users.name }).from(users).where(eq(users.id, p.siteManagerId)).get()
      : null;
    return { ...p, siteManagerName: sm?.name || null };
  });

  // Filter by search after query (SQLite doesn't have ILIKE)
  const filtered = search
    ? enriched.filter((p) => p.name.toLowerCase().includes((search as string).toLowerCase()))
    : enriched;

  res.json(filtered);
});

// GET /api/projects/:id — detail with site manager info
router.get("/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const project = await db.select().from(projects).where(eq(projects.id, id)).get();
  if (!project) {
    res.status(404).json({ message: "Proyek tidak ditemukan" });
    return;
  }

  const sm = project.siteManagerId
    ? await db.select({ id: users.id, name: users.name, email: users.email }).from(users).where(eq(users.id, project.siteManagerId)).get()
    : null;

  res.json({ ...project, siteManager: sm });
});

// POST /api/projects — create new project (owner & finance only)
router.post("/", authorize("owner", "finance"), async (req: Request, res: Response) => {
  const { name, type, poValue, budgetType, budgetPercent, budgetValue, siteManagerId, startDate, endDate } = req.body;
  if (!name || !type || !poValue || !budgetType || !budgetValue || !startDate) {
    res.status(400).json({ message: "Nama, jenis, nilai PO, tipe budget, nilai budget, dan tanggal mulai wajib diisi" });
    return;
  }

  const newProject = await db.insert(projects).values({
    name,
    type,
    poValue,
    budgetType,
    budgetPercent: budgetPercent || null,
    budgetValue,
    siteManagerId: siteManagerId || null,
    startDate,
    endDate: endDate || null,
  }).returning().get();

  res.status(201).json(newProject);
});

// PUT /api/projects/:id — update project (owner & finance only)
router.put("/:id", authorize("owner", "finance"), async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const existing = await db.select().from(projects).where(eq(projects.id, id)).get();
  if (!existing) {
    res.status(404).json({ message: "Proyek tidak ditemukan" });
    return;
  }

  const { name, type, poValue, budgetType, budgetPercent, budgetValue, siteManagerId, status, startDate, endDate } = req.body;
  const updateData: any = {};
  if (name !== undefined) updateData.name = name;
  if (type !== undefined) updateData.type = type;
  if (poValue !== undefined) updateData.poValue = poValue;
  if (budgetType !== undefined) updateData.budgetType = budgetType;
  if (budgetPercent !== undefined) updateData.budgetPercent = budgetPercent;
  if (budgetValue !== undefined) updateData.budgetValue = budgetValue;
  if (siteManagerId !== undefined) updateData.siteManagerId = siteManagerId;
  if (status !== undefined) updateData.status = status;
  if (startDate !== undefined) updateData.startDate = startDate;
  if (endDate !== undefined) updateData.endDate = endDate;

  const updated = await db.update(projects).set(updateData).where(eq(projects.id, id)).returning().get();
  res.json(updated);
});

export default router;
