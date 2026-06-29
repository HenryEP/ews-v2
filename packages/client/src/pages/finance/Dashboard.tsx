import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { get } from "../../api";
import { formatRupiah } from "../../types";
import type { DashboardSummary, DashboardProject } from "../../types";

export default function FinanceDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [projects, setProjects] = useState<DashboardProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      get<DashboardSummary>("/api/dashboard/summary"),
      get<DashboardProject[]>("/api/dashboard/projects"),
    ])
      .then(([s, p]) => { setSummary(s); setProjects(p); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const ewsBadge: Record<string, string> = {
    aman: "bg-green-100 text-green-700",
    waspada: "bg-yellow-100 text-yellow-700",
    bahaya: "bg-orange-100 text-orange-700",
    kritis: "bg-red-100 text-red-700",
    overrun: "bg-red-200 text-red-900",
  };

  const progressColor: Record<string, string> = {
    aman: "bg-green-500",
    waspada: "bg-yellow-500",
    bahaya: "bg-orange-500",
    kritis: "bg-red-500",
    overrun: "bg-red-700",
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💰</span>
            <div>
              <h1 className="font-bold text-gray-800">EWS Finance</h1>
              <p className="text-xs text-gray-500">Dashboard Keuangan</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/finance/projects")} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              📋 Daftar Proyek
            </button>
            <span className="text-sm text-gray-600">{user?.name}</span>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Finance</span>
            <button onClick={logout} className="text-sm text-red-600 hover:text-red-800 cursor-pointer">Keluar</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-6">{error}</div>
        )}

        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-sm border p-5">
              <p className="text-sm text-gray-500">Proyek Aktif</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{summary.totalProyekAktif}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-5">
              <p className="text-sm text-gray-500">Total Nilai PO</p>
              <p className="text-xl font-bold text-green-600 mt-1">{formatRupiah(summary.totalNilaiPO)}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-5">
              <p className="text-sm text-gray-500">Total Realisasi</p>
              <p className="text-xl font-bold text-yellow-600 mt-1">{formatRupiah(summary.totalRealisasi)}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border p-5">
              <p className="text-sm text-gray-500">Sisa Anggaran</p>
              <p className={`text-xl font-bold mt-1 ${summary.sisaAnggaran < 0 ? "text-red-600" : "text-purple-600"}`}>
                {formatRupiah(summary.sisaAnggaran)}
              </p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="font-semibold text-lg">Status Anggaran Semua Proyek</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500 bg-gray-50">
                  <th className="px-6 py-3 font-medium">Nama Proyek</th>
                  <th className="px-6 py-3 font-medium">Budget</th>
                  <th className="px-6 py-3 font-medium">Realisasi</th>
                  <th className="px-6 py-3 font-medium w-48">Progress</th>
                  <th className="px-6 py-3 font-medium">Status EWS</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => (
                  <tr key={p.id} className="border-b">
                    <td className="px-6 py-3 font-medium text-gray-800">{p.name}</td>
                    <td className="px-6 py-3 text-gray-600">{formatRupiah(p.budgetValue)}</td>
                    <td className="px-6 py-3 text-gray-600">{formatRupiah(p.realisasi)}</td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${progressColor[p.ewsStatus] || "bg-gray-400"}`} style={{ width: `${Math.min(p.percent, 100)}%` }} />
                        </div>
                        <span className="text-xs text-gray-500 w-10 text-right">{p.percent}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${ewsBadge[p.ewsStatus] || "bg-gray-100"}`}>
                        {p.ewsLabel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
