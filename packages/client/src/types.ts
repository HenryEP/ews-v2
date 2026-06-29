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
