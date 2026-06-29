import { useState, useEffect, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { get, post } from "../../api";
import { PROJECT_TYPES } from "../../types";
import type { SiteManager } from "../../types";

export default function ProjectNew() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [type, setType] = useState("pengadaan");
  const [poValue, setPoValue] = useState("");
  const [budgetType, setBudgetType] = useState<"rab" | "percent">("percent");
  const [budgetPercent, setBudgetPercent] = useState("65");
  const [budgetValue, setBudgetValue] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [siteManagerId, setSiteManagerId] = useState("");
  const [siteManagers, setSiteManagers] = useState<SiteManager[]>([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    get<SiteManager[]>("/api/projects/site-managers")
      .then(setSiteManagers)
      .catch(() => {});
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const budgetVal = budgetType === "percent"
        ? Math.round(parseInt(poValue) * parseInt(budgetPercent) / 100)
        : parseInt(budgetValue);
      
      await post("/api/projects", {
        name,
        type,
        poValue: parseInt(poValue),
        budgetType,
        budgetPercent: budgetType === "percent" ? parseInt(budgetPercent) : null,
        budgetValue: budgetVal,
        siteManagerId: siteManagerId ? parseInt(siteManagerId) : null,
        startDate,
        endDate: endDate || null,
      });
      navigate("/owner/projects");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  const computedBudget = parseInt(poValue) && parseInt(budgetPercent)
    ? Math.round(parseInt(poValue) * parseInt(budgetPercent) / 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/owner/projects")} className="text-gray-400 hover:text-gray-600 text-xl">&larr;</button>
            <h1 className="font-bold text-gray-800">Tambah Proyek Baru</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">{user?.name}</span>
            <button onClick={logout} className="text-sm text-red-600">Keluar</button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-6 space-y-5">
          {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Proyek</label>
            <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Nama proyek" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Proyek</label>
              <select value={type} onChange={(e) => setType(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg">
                {Object.entries(PROJECT_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nilai PO (Rp)</label>
              <input required type="number" value={poValue} onChange={(e) => setPoValue(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="500000000" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipe Budget</label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="budgetType" checked={budgetType === "percent"} onChange={() => setBudgetType("percent")} />
                <span className="text-sm">Persentase dari PO</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="budgetType" checked={budgetType === "rab"} onChange={() => setBudgetType("rab")} />
                <span className="text-sm">RAB Terinci (manual)</span>
              </label>
            </div>
          </div>

          {budgetType === "percent" ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Persentase Budget (%)</label>
                <input required type="number" min={1} max={100} value={budgetPercent} onChange={(e) => setBudgetPercent(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nilai Budget (auto)</label>
                <input disabled value={computedBudget.toLocaleString("id-ID")} className="w-full px-4 py-2.5 border rounded-lg bg-gray-50 text-gray-500" />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nilai Budget RAB (Rp)</label>
              <input required type="number" value={budgetValue} onChange={(e) => setBudgetValue(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg" placeholder="1850000000" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label>
              <input required type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Selesai</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Site Manager</label>
            <select value={siteManagerId} onChange={(e) => setSiteManagerId(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg">
              <option value="">-- Pilih Site Manager --</option>
              {siteManagers.map((sm) => <option key={sm.id} value={sm.id}>{sm.name}</option>)}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={submitting} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 font-medium">
              {submitting ? "Menyimpan..." : "Simpan Proyek"}
            </button>
            <button type="button" onClick={() => navigate("/owner/projects")} className="px-6 py-2.5 border rounded-lg hover:bg-gray-50 text-gray-600">
              Batal
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
