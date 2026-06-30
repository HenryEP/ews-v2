import { Router, Request, Response } from "express";
import { db } from "../db/index.js";
import { projects } from "../db/schema.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { authenticate } from "../middleware/auth.js";

const router = Router();
router.use(authenticate);

// EWS status calculation
function getEwsStatus(percent: number): { level: string; color: string; label: string } {
  if (percent > 100) return { level: "overrun", color: "red", label: "Overrun" };
  if (percent >= 95) return { level: "kritis", color: "red", label: "Kritis" };
  if (percent >= 85) return { level: "bahaya", color: "orange", label: "Bahaya" };
  if (percent >= 70) return { level: "waspada", color: "yellow", label: "Waspada" };
  return { level: "aman", color: "green", label: "Aman" };
}

// GET /api/dashboard/summary — executive summary cards
router.get("/summary", async (req: Request, res: Response) => {
  const allProjects = await db.select().from(projects);
  const activeProjects = allProjects.filter((p) => p.status === "aktif");

  const totalPO = activeProjects.reduce((sum, p) => sum + p.poValue, 0);
  const totalRealisasi = activeProjects.reduce((sum, p) => sum + p.realisasi, 0);
  const totalBudget = activeProjects.reduce((sum, p) => sum + p.budgetValue, 0);
  const sisaAnggaran = totalBudget - totalRealisasi;

  res.json({
    totalProyekAktif: activeProjects.length,
    totalNilaiPO: totalPO,
    totalRealisasi,
    totalBudget,
    sisaAnggaran,
  });
});

// GET /api/dashboard/projects — project list with EWS status
router.get("/projects", async (req: Request, res: Response) => {
  const allProjects = await db.select().from(projects);

  const enriched = [];
  for (const p of allProjects) {
    const percent = p.budgetValue > 0 ? Math.round((p.realisasi / p.budgetValue) * 100) : 0;
    const ews = getEwsStatus(percent);
    const sm = p.siteManagerId
      ? (await db.select({ name: users.name }).from(users).where(eq(users.id, p.siteManagerId)).limit(1))[0]
      : null;
    enriched.push({
      ...p,
      percent,
      ewsStatus: ews.level,
      ewsColor: ews.color,
      ewsLabel: ews.label,
      siteManagerName: sm?.name || null,
    });
  }

  // If site_manager, filter to only their project
  if (req.user?.role === "site_manager") {
    const [user] = await db.select().from(users).where(eq(users.id, req.user.userId)).limit(1);
    if (user?.projectId) {
      const filtered = enriched.filter((p) => p.id === user.projectId);
      res.json(filtered);
      return;
    }
    res.json([]);
    return;
  }

  res.json(enriched);
});

export default router;
