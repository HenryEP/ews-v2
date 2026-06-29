import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { get } from "../../api";
import type { Project } from "../../types";
import { PROJECT_TYPES, PROJECT_STATUSES, formatRupiah } from "../../types";

export default function FinanceProjects() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterType, setFilterType] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (filterStatus) params.set("status", filterStatus);
    if (filterType) params.set("type", filterType);
    const qs = params.toString();
    get<Project[]>(`/api/projects${qs ? `?${qs}` : ""}`)
      .then(setProjects)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [filterStatus, filterType]);

  const filtered = search
    ? projects.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    : projects;

  const statusColor: Record<string, string> = {
    aktif: "bg-blue-100 text-blue-700",
    selesai: "bg-green-100 text-green-700",
    ditunda: "bg-yellow-100 text-yellow-700",
    dibatalkan: "bg-red-100 text-red-700",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📋</span>
            <div>
              <h1 className="font-bold text-gray-800">Daftar Proyek</h1>
              <p className="text-xs text-gray-500">Finance View</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/finance")} className="text-sm text-blue-600 hover:text-blue-800">Dashboard</button>
            <span className="text-sm text-gray-600">{user?.name}</span>
            <button onClick={logout} className="text-sm text-red-600 hover:text-red-800">Keluar</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 border rounded-lg text-sm">
              <option value="">Semua Status</option>
              {Object.entries(PROJECT_STATUSES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-3 py-2 border rounded-lg text-sm">
              <option value="">Semua Jenis</option>
              {Object.entries(PROJECT_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <input type="text" placeholder="Cari proyek..." value={search} onChange={(e) => setSearch(e.target.value)} className="px-3 py-2 border rounded-lg text-sm flex-1" />
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-500">Memuat...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-3 font-medium">Nama Proyek</th>
                    <th className="pb-3 font-medium">Jenis</th>
                    <th className="pb-3 font-medium">Nilai PO</th>
                    <th className="pb-3 font-medium">Budget</th>
                    <th className="pb-3 font-medium">Site Manager</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 font-medium text-gray-800">{p.name}</td>
                      <td className="py-3 text-gray-600">{PROJECT_TYPES[p.type] || p.type}</td>
                      <td className="py-3 text-gray-600">{formatRupiah(p.poValue)}</td>
                      <td className="py-3 text-gray-600">{formatRupiah(p.budgetValue)}</td>
                      <td className="py-3 text-gray-600">{p.siteManagerName || "-"}</td>
                      <td className="py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[p.status] || "bg-gray-100"}`}>
                          {PROJECT_STATUSES[p.status] || p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && <div className="text-center py-8 text-gray-400">Tidak ada proyek ditemukan</div>}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
