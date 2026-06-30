import { Router, Request, Response } from "express";
import { db } from "../db/index.js";
import { thresholds } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();
router.use(authenticate);

// Default thresholds
const DEFAULTS = { waspada: 70, bahaya: 85, kritis: 95 };

// GET /api/thresholds/:projectId — get thresholds for a project
router.get("/:projectId", async (req: Request, res: Response) => {
  const projectId = parseInt(req.params.projectId);
  const rows = await db.select().from(thresholds).where(eq(thresholds.projectId, projectId));

  if (rows.length === 0) {
    res.json({
      projectId,
      waspada: DEFAULTS.waspada,
      bahaya: DEFAULTS.bahaya,
      kritis: DEFAULTS.kritis,
      isDefaults: true,
    });
    return;
  }

  const result: any = { projectId, isDefaults: false };
  for (const r of rows) result[r.level] = r.percent;
  if (!result.waspada) result.waspada = DEFAULTS.waspada;
  if (!result.bahaya) result.bahaya = DEFAULTS.bahaya;
  if (!result.kritis) result.kritis = DEFAULTS.kritis;
  res.json(result);
});

// PUT /api/thresholds/:projectId — update thresholds for a project
router.put("/:projectId", authorize("owner"), async (req: Request, res: Response) => {
  const projectId = parseInt(req.params.projectId);
  const { waspada, bahaya, kritis } = req.body;

  if (waspada !== undefined && (waspada < 1 || waspada > 100)) {
    res.status(400).json({ message: "Waspada harus 1-100" }); return;
  }
  if (bahaya !== undefined && (bahaya < 1 || bahaya > 100)) {
    res.status(400).json({ message: "Bahaya harus 1-100" }); return;
  }
  if (kritis !== undefined && (kritis < 1 || kritis > 100)) {
    res.status(400).json({ message: "Kritis harus 1-100" }); return;
  }

  const levels = [
    { level: "waspada" as const, percent: waspada },
    { level: "bahaya" as const, percent: bahaya },
    { level: "kritis" as const, percent: kritis },
  ];

  for (const { level, percent } of levels) {
    if (percent === undefined) continue;
    const [existing] = await db.select().from(thresholds)
      .where(eq(thresholds.projectId, projectId))
      .limit(1);

    if (existing) {
      await db.update(thresholds).set({ percent })
        .where(eq(thresholds.id, existing.id));
    } else {
      await db.insert(thresholds).values({ projectId, level, percent });
    }
  }

  const updated = await db.select().from(thresholds).where(eq(thresholds.projectId, projectId));
  const result: any = { projectId, isDefaults: false };
  for (const r of updated) result[r.level] = r.percent;
  if (!result.waspada) result.waspada = DEFAULTS.waspada;
  if (!result.bahaya) result.bahaya = DEFAULTS.bahaya;
  if (!result.kritis) result.kritis = DEFAULTS.kritis;

  res.json(result);
});

export default router;
