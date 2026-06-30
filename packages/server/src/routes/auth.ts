import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ message: "Email dan password wajib diisi" });
    return;
  }

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user) {
    res.status(401).json({ message: "Email atau password salah" });
    return;
  }

  if (!user.isActive) {
    res.status(403).json({ message: "Akun dinonaktifkan" });
    return;
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    res.status(401).json({ message: "Email atau password salah" });
    return;
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || "secret",
    { expiresIn: "24h" }
  );

  const { password: _, ...userWithoutPassword } = user;
  res.json({ token, user: userWithoutPassword });
});

// POST /api/auth/register
router.post("/register", authenticate, authorize("owner"), async (req: Request, res: Response) => {
  const { email, password, name, role, projectId } = req.body;
  if (!email || !password || !name || !role) {
    res.status(400).json({ message: "Email, password, nama, dan role wajib diisi" });
    return;
  }

  if (!["owner", "finance", "site_manager"].includes(role)) {
    res.status(400).json({ message: "Role tidak valid" });
    return;
  }

  const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing) {
    res.status(409).json({ message: "Email sudah terdaftar" });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const [newUser] = await db.insert(users).values({
    email,
    password: hashedPassword,
    name,
    role,
    projectId: projectId || null,
  }).returning();

  const { password: _, ...userWithoutPassword } = newUser!;
  res.status(201).json(userWithoutPassword);
});

// GET /api/auth/me
router.get("/me", authenticate, async (req: Request, res: Response) => {
  const [user] = await db.select().from(users).where(eq(users.id, req.user!.userId)).limit(1);
  if (!user) {
    res.status(404).json({ message: "User tidak ditemukan" });
    return;
  }
  const { password: _, ...userWithoutPassword } = user;
  res.json(userWithoutPassword);
});

export default router;
