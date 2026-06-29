import { useState, useEffect, type FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { get, put } from "../../api";
import { PROJECT_TYPES, PROJECT_STATUSES, formatRupiah } from "../../types";
import type { Project } from "../../types";

interface ProjectDetail extends Project {
  siteManager: { id: number; name: string; email: string } | null;
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [budgetType, setBudgetType] = useState<"rab" | "percent">("percent");
  const [budgetPercent, setBudgetPercent] = useState("");
  const [budgetValue, setBudgetValue] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    get<ProjectDetail>(`/api/projects/${id}`)
      .then((p) => {
        setProject(p);
        setBudgetType(p.budgetType);
        setBudgetPercent(p.budgetPercent?.toString() || "");
        setBudgetValue(p.budgetValue.toString());
        setStatus(p.status);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const budgetVal = budgetType === "percent"
        ? Math.round(project!.poValue * parseInt(budgetPercent) / 100)
        : parseInt(budgetValue);
      const updated = await put<Project>(`/api/projects/${id}`, {
        budgetType,
        budgetPercent: budgetType === "percent" ? parseInt(budgetPercent) : null,
        budgetValue: budgetVal,
        status,
      });
      setProject({ ...project!, ...updated });
      setError("");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  const budgetPct = project ? Math.round((project.budgetValue / project.poValue) * 100) : 0;

  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  if (!project) return <div className="min-h-screen flex items-center justify-center text-gray-500">Proyek tidak ditemukan</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/owner/projects")} className="text-gray-400 hover:text-gray-600 text-xl">&larr;</button>
            <div>
              <h1 className="font-bold text-gray-800">{project.name}</h1>
              <p className="text-xs text-gray-500">Detail Proyek</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">{user?.name}</span>
            <button onClick={logout} className="text-sm text-red-600">Keluar</button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Info Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-xs text-gray-500">Jenis</p>
            <p className="font-semibold mt-1">{PROJECT_TYPES[project.type]}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-xs text-gray-500">Nilai PO</p>
            <p className="font-semibold mt-1">{formatRupiah(project.poValue)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-xs text-gray-500">Budget</p>
            <p className="font-semibold mt-1">{formatRupiah(project.budgetValue)} ({budgetPct}%)</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-xs text-gray-500">Site Manager</p>
            <p className="font-semibold mt-1">{project.siteManager?.name || "-"}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-xs text-gray-500">Tanggal Mulai</p>
            <p className="font-semibold mt-1">{project.startDate}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <p className="text-xs text-gray-500">Tanggal Selesai</p>
            <p className="font-semibold mt-1">{project.endDate || "-"}</p>
          </div>
        </div>

        {/* Edit Budget & Status */}
        <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm border p-6 space-y-5">
          <h2 className="font-semibold text-lg">Pengaturan Budget & Status</h2>
          {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipe Budget</label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={budgetType === "percent"} onChange={() => setBudgetType("percent")} />
                <span className="text-sm">Persentase PO</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={budgetType === "rab"} onChange={() => setBudgetType("rab")} />
                <span className="text-sm">RAB Terinci</span>
              </label>
            </div>
          </div>

          {budgetType === "percent" ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Persentase Budget (%)</label>
              <input type="number" value={budgetPercent} onChange={(e) => setBudgetPercent(e.target.value)} className="w-40 px-4 py-2 border rounded-lg" />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nilai Budget RAB (Rp)</label>
              <input type="number" value={budgetValue} onChange={(e) => setBudgetValue(e.target.value)} className="w-60 px-4 py-2 border rounded-lg" />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status Proyek</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-4 py-2 border rounded-lg">
              {Object.entries(PROJECT_STATUSES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>

          <button type="submit" disabled={saving} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 font-medium">
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </form>
      </main>
    </div>
  );
}
