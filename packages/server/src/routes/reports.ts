import { Router, Request, Response } from "express";
import { db } from "../db/index.js";
import { projects, transaksi, users } from "../db/schema.js";
import { eq, gte, lte } from "drizzle-orm";
import { authenticate } from "../middleware/auth.js";
import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";

const router = Router();
router.use(authenticate);

function getEwsStatus(percent: number): string {
  if (percent > 100) return "Overrun";
  if (percent >= 95) return "Kritis";
  if (percent >= 85) return "Bahaya";
  if (percent >= 70) return "Waspada";
  return "Aman";
}

function formatRupiah(value: number): string {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

function formatDate(date: string): string {
  const d = new Date(date);
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
}

// ========== PDF HELPERS ==========

function pdfHeader(doc: PDFKit.PDFDocument, title: string, subtitle?: string) {
  doc.fontSize(16).font("Helvetica-Bold").text("EWS - Early Warning System", { align: "center" });
  doc.fontSize(10).font("Helvetica").text("Sistem Pemantauan Anggaran Proyek", { align: "center" });
  if (subtitle) doc.fontSize(9).text(subtitle, { align: "center" });
  doc.moveDown(0.5);
  doc.fontSize(13).font("Helvetica-Bold").text(title, { align: "center" });
  doc.moveDown(0.5);
  const now = formatDate(new Date().toISOString());
  doc.fontSize(8).font("Helvetica").fillColor("gray").text(`Dicetak: ${now}`, { align: "center" });
  doc.fillColor("black");
  doc.moveDown(1);
}

function pdfTable(doc: PDFKit.PDFDocument, headers: string[], rows: string[][], colWidths: number[]) {
  const startX = 50;
  let y = doc.y;
  const rowH = 20;

  // Header
  doc.font("Helvetica-Bold").fontSize(8);
  let x = startX;
  headers.forEach((h, i) => {
    doc.fillColor("#f0f0f0").rect(x, y, colWidths[i], rowH).fill();
    doc.fillColor("black").text(h, x + 3, y + 5, { width: colWidths[i] - 6, align: "left" });
    x += colWidths[i];
  });
  y += rowH;

  // Rows
  doc.font("Helvetica").fontSize(7);
  for (const row of rows) {
    if (y > 700) { doc.addPage(); y = 50; x = startX; }
    x = startX;
    row.forEach((cell, i) => {
      doc.text(cell, x + 3, y + 5, { width: colWidths[i] - 6, align: i === colWidths.length - 1 ? "right" : "left" });
      x += colWidths[i];
    });
    // Draw border
    doc.strokeColor("#ddd").lineWidth(0.5);
    doc.moveTo(startX, y + rowH).lineTo(startX + colWidths.reduce((a, b) => a + b, 0), y + rowH).stroke();
    y += rowH;
  }
}

// ========== ROUTES ==========

// GET /api/reports/projects-list — list projects for dropdown
router.get("/projects-list", async (_req: Request, res: Response) => {
  const list = await db.select({ id: projects.id, name: projects.name }).from(projects);
  res.json(list);
});

// GET /api/reports/summary/pdf — ringkasan semua proyek PDF
router.get("/summary/pdf", async (req: Request, res: Response) => {
  const allProjects = await db.select().from(projects);

  const doc = new PDFDocument({ margin: 40, size: "A4", layout: "landscape" });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=laporan-ringkasan-proyek.pdf");
  doc.pipe(res);

  pdfHeader(doc, "Laporan Ringkasan Semua Proyek");

  const headers = ["Nama Proyek", "Jenis", "Budget", "Realisasi", "%", "Sisa", "Status EWS"];
  const colWidths = [280, 70, 90, 90, 40, 90, 80];
  const rows: string[][] = [];

  for (const p of allProjects) {
    const percent = p.budgetValue > 0 ? Math.round((p.realisasi / p.budgetValue) * 100) : 0;
    rows.push([
      p.name,
      p.type,
      formatRupiah(p.budgetValue),
      formatRupiah(p.realisasi),
      `${percent}%`,
      formatRupiah(p.budgetValue - p.realisasi),
      getEwsStatus(percent),
    ]);
  }

  pdfTable(doc, headers, rows, colWidths);

  doc.moveDown(1);
  const totalBudget = allProjects.reduce((s, p) => s + p.budgetValue, 0);
  const totalRealisasi = allProjects.reduce((s, p) => s + p.realisasi, 0);
  doc.fontSize(8).font("Helvetica-Bold");
  doc.text(`Total Budget: ${formatRupiah(totalBudget)}    Total Realisasi: ${formatRupiah(totalRealisasi)}    Sisa: ${formatRupiah(totalBudget - totalRealisasi)}`, { align: "right" });

  doc.end();
});

// GET /api/reports/summary/excel — ringkasan semua proyek Excel
router.get("/summary/excel", async (req: Request, res: Response) => {
  const allProjects = await db.select().from(projects);

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Ringkasan Proyek");

  ws.columns = [
    { header: "Nama Proyek", key: "name", width: 40 },
    { header: "Jenis", key: "type", width: 15 },
    { header: "Nilai PO", key: "poValue", width: 18 },
    { header: "Budget", key: "budgetValue", width: 18 },
    { header: "Realisasi", key: "realisasi", width: 18 },
    { header: "Persentase", key: "percent", width: 10 },
    { header: "Sisa", key: "sisa", width: 18 },
    { header: "Status EWS", key: "ews", width: 15 },
    { header: "Status Proyek", key: "status", width: 15 },
  ];

  for (const p of allProjects) {
    const percent = p.budgetValue > 0 ? Math.round((p.realisasi / p.budgetValue) * 100) : 0;
    ws.addRow({
      name: p.name, type: p.type, poValue: p.poValue, budgetValue: p.budgetValue,
      realisasi: p.realisasi, percent, sisa: p.budgetValue - p.realisasi,
      ews: getEwsStatus(percent), status: p.status,
    });
  }

  // Style header
  ws.getRow(1).font = { bold: true };
  ws.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE0E0E0" } as any };

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", "attachment; filename=laporan-ringkasan-proyek.xlsx");
  await wb.xlsx.write(res);
  res.end();
});

// GET /api/reports/project/:id/pdf — detail proyek PDF
router.get("/project/:id/pdf", async (req: Request, res: Response) => {
  const projectId = parseInt(req.params.id);
  const [project] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
  if (!project) { res.status(404).json({ message: "Proyek tidak ditemukan" }); return; }

  const [sm] = project.siteManagerId
    ? await db.select({ name: users.name }).from(users).where(eq(users.id, project.siteManagerId)).limit(1)
    : [null];

  const { startDate, endDate } = req.query;
  let query = db.select().from(transaksi).where(eq(transaksi.projectId, projectId));
  if (startDate) query = query.where(gte(transaksi.date, startDate as string));
  if (endDate) query = query.where(lte(transaksi.date, endDate as string));
  const txList = await query;

  const percent = project.budgetValue > 0 ? Math.round((project.realisasi / project.budgetValue) * 100) : 0;

  const doc = new PDFDocument({ margin: 40, size: "A4" });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=laporan-${project.name.replace(/\s+/g, "-").toLowerCase()}.pdf`);
  doc.pipe(res);

  pdfHeader(doc, "Laporan Detail Proyek", project.name);

  // Project info
  doc.fontSize(9).font("Helvetica");
  const info = [
    ["Nama Proyek", project.name],
    ["Jenis", project.type],
    ["Nilai PO", formatRupiah(project.poValue)],
    ["Budget", formatRupiah(project.budgetValue)],
    ["Realisasi", `${formatRupiah(project.realisasi)} (${percent}%)`],
    ["Sisa Anggaran", formatRupiah(project.budgetValue - project.realisasi)],
    ["Status EWS", getEwsStatus(percent)],
    ["Status Proyek", project.status],
    ["Site Manager", sm?.name || "-"],
    ["Tanggal Mulai", project.startDate],
    ["Tanggal Selesai", project.endDate || "-"],
  ];
  info.forEach(([label, value]) => {
    doc.font("Helvetica-Bold").text(`${label}: `, { continued: true });
    doc.font("Helvetica").text(value);
  });

  doc.moveDown(1);

  // Transactions table
  doc.fontSize(11).font("Helvetica-Bold").text("Riwayat Transaksi");
  doc.moveDown(0.5);

  const headers = ["Tanggal", "Tipe", "Deskripsi", "Kategori", "Jumlah"];
  const colWidths = [70, 60, 180, 60, 80];
  const rows: string[][] = txList.map((t) => [
    t.date, t.type, t.description || "", t.category, formatRupiah(t.amount),
  ]);

  if (rows.length > 0) {
    pdfTable(doc, headers, rows, colWidths);
  } else {
    doc.fontSize(8).text("Belum ada transaksi");
  }

  doc.moveDown(1);
  const total = txList.reduce((s, t) => s + t.amount, 0);
  doc.fontSize(9).font("Helvetica-Bold").text(`Total Transaksi: ${formatRupiah(total)}`, { align: "right" });

  if (startDate || endDate) {
    doc.moveDown(0.5);
    doc.fontSize(7).font("Helvetica").fillColor("gray").text(
      `Periode: ${startDate || "awal"} s/d ${endDate || "sekarang"}`, { align: "right" }
    );
  }

  doc.end();
});

// GET /api/reports/project/:id/excel — detail proyek Excel
router.get("/project/:id/excel", async (req: Request, res: Response) => {
  const projectId = parseInt(req.params.id);
  const [project] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
  if (!project) { res.status(404).json({ message: "Proyek tidak ditemukan" }); return; }

  const { startDate, endDate } = req.query;
  let query = db.select().from(transaksi).where(eq(transaksi.projectId, projectId));
  if (startDate) query = query.where(gte(transaksi.date, startDate as string));
  if (endDate) query = query.where(lte(transaksi.date, endDate as string));
  const txList = await query;

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet("Detail Proyek");

  // Info section
  const percent = project.budgetValue > 0 ? Math.round((project.realisasi / project.budgetValue) * 100) : 0;
  ws.addRow(["Laporan Detail Proyek"]);
  ws.addRow([`Proyek: ${project.name}`]);
  ws.addRow([`Jenis: ${project.type}  |  Nilai PO: ${formatRupiah(project.poValue)}`]);
  ws.addRow([`Budget: ${formatRupiah(project.budgetValue)}  |  Realisasi: ${formatRupiah(project.realisasi)} (${percent}%)`]);
  ws.addRow([`Sisa: ${formatRupiah(project.budgetValue - project.realisasi)}  |  Status EWS: ${getEwsStatus(percent)}`]);
  ws.addRow([`Dicetak: ${formatDate(new Date().toISOString())}`]);
  ws.addRow([]);

  // Transactions table
  ws.addRow(["Tanggal", "Tipe", "Vendor", "Deskripsi", "Kategori", "Jumlah"]);
  ws.getRow(8).font = { bold: true };
  ws.getRow(8).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE0E0E0" } as any };

  for (const t of txList) {
    ws.addRow([t.date, t.type, t.vendor || "-", t.description, t.category, t.amount]);
  }

  ws.addRow([]);
  const total = txList.reduce((s, t) => s + t.amount, 0);
  ws.addRow(["", "", "", "", "Total:", total]);
  ws.getRow(ws.rowCount).font = { bold: true };

  ws.columns = [
    { width: 14 }, { width: 14 }, { width: 20 }, { width: 30 }, { width: 14 }, { width: 18 },
  ];

  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", `attachment; filename=laporan-${project.name.replace(/\s+/g, "-").toLowerCase()}.xlsx`);
  await wb.xlsx.write(res);
  res.end();
});

export default router;
