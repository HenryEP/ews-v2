export interface Project {
  id: number;
  name: string;
  type: "pengadaan" | "konstruksi" | "jasa" | "jasa_perbaikan" | "lainnya";
  poValue: number;
  budgetType: "rab" | "percent";
  budgetPercent: number | null;
  budgetValue: number;
  siteManagerId: number | null;
  siteManagerName: string | null;
  status: "aktif" | "selesai" | "ditunda" | "dibatalkan";
  startDate: string;
  endDate: string | null;
  createdAt: string;
}

export interface SiteManager {
  id: number;
  name: string;
  email: string;
}

export const PROJECT_TYPES: Record<string, string> = {
  pengadaan: "Pengadaan",
  konstruksi: "Konstruksi",
  jasa: "Jasa",
  jasa_perbaikan: "Jasa Perbaikan",
  lainnya: "Lainnya",
};

export const PROJECT_STATUSES: Record<string, string> = {
  aktif: "Aktif",
  selesai: "Selesai",
  ditunda: "Ditunda",
  dibatalkan: "Dibatalkan",
};

export function formatRupiah(value: number): string {
  if (value >= 1_000_000_000) return `Rp ${(value / 1_000_000_000).toFixed(1)} M`;
  if (value >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(0)} Jt`;
  return `Rp ${value.toLocaleString("id-ID")}`;
}

export interface DashboardSummary {
  totalProyekAktif: number;
  totalNilaiPO: number;
  totalRealisasi: number;
  totalBudget: number;
  sisaAnggaran: number;
}

export interface DashboardProject {
  id: number;
  name: string;
  type: string;
  poValue: number;
  budgetType: string;
  budgetPercent: number | null;
  budgetValue: number;
  realisasi: number;
  siteManagerId: number | null;
  siteManagerName: string | null;
  status: string;
  startDate: string;
  endDate: string | null;
  percent: number;
  ewsStatus: string;
  ewsColor: string;
  ewsLabel: string;
}

export interface Pengajuan {
  id: number;
  projectId: number;
  siteManagerId: number;
  description: string;
  estimatedCost: number;
  category: "material" | "jasa" | "alat" | "lainnya";
  notes: string | null;
  status: "menunggu" | "disetujui" | "ditolak";
  createdAt: string;
  projectName?: string;
  siteManagerName?: string;
}

export interface Transaksi {
  id: number;
  projectId: number;
  pengajuanId: number | null;
  type: "po" | "invoice" | "bon" | "tanpa_dokumen";
  amount: number;
  date: string;
  vendor: string | null;
  category: "material" | "jasa" | "alat" | "lainnya";
  description: string;
  approvedByOwner: number;
  financeId: number | null;
  createdAt: string;
  projectName?: string;
  financeName?: string;
}

export const TRANSACTION_TYPES: Record<string, string> = {
  po: "PO ke Vendor",
  invoice: "Invoice",
  bon: "Bon / Kwitansi",
  tanpa_dokumen: "Tanpa Dokumen",
};

export const CATEGORIES: Record<string, string> = {
  material: "Material",
  jasa: "Jasa",
  alat: "Alat",
  lainnya: "Lainnya",
};

export const PENGAJUAN_STATUSES: Record<string, string> = {
  menunggu: "Menunggu",
  disetujui: "Disetujui",
  ditolak: "Ditolak",
};
