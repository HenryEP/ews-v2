import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { get } from "../../api";
import { formatRupiah, TRANSACTION_TYPES, CATEGORIES } from "../../types";
import type { Transaksi, Project } from "../../types";

export default function TransaksiList() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [transaksiList, setTransaksiList] = useState<Transaksi[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterProject, setFilterProject] = useState("");

  useEffect(() => {
    Promise.all([
      get<Transaksi[]>("/api/transaksi"),
      get<Project[]>("/api/projects"),
    ]).then(([t, p]) => { setTransaksiList(t); setProjects(p); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filterProject
    ? transaksiList.filter((t) => t.projectId === parseInt(filterProject))
    : transaksiList;

  const typeBadge: Record<string, string> = {
    po: "bg-purple-100 text-purple-700",
    invoice: "bg-blue-100 text-blue-700",
    bon: "bg-green-100 text-green-700",
    tanpa_dokumen: "bg-yellow-100 text-yellow-700",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/finance")} className="text-gray-400 hover:text-gray-600 text-xl">&larr;</button>
            <div>
              <h1 className="font-bold text-gray-800">Riwayat Transaksi</h1>
              <p className="text-xs text-gray-500">Semua pengeluaran tercatat</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/finance/transaksi/new")} className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">+ Transaksi Baru</button>
            <span className="text-sm text-gray-600">{user?.name}</span>
            <button onClick={logout} className="text-sm text-red-600">Keluar</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex gap-4 mb-6">
            <select value={filterProject} onChange={(e) => setFilterProject(e.target.value)} className="px-3 py-2 border rounded-lg text-sm">
              <option value="">Semua Proyek</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <span className="text-sm text-gray-400 self-center">{filtered.length} transaksi</span>
          </div>

          {loading ? (
            <p className="text-center py-8 text-gray-500">Memuat...</p>
          ) : error ? (
            <p className="text-center py-8 text-red-500">{error}</p>
          ) : filtered.length === 0 ? (
            <p className="text-center py-8 text-gray-400">Belum ada transaksi</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500 bg-gray-50">
                    <th className="px-4 py-3 font-medium">Tanggal</th>
                    <th className="px-4 py-3 font-medium">Proyek</th>
                    <th className="px-4 py-3 font-medium">Tipe</th>
                    <th className="px-4 py-3 font-medium">Deskripsi</th>
                    <th className="px-4 py-3 font-medium">Kategori</th>
                    <th className="px-4 py-3 font-medium text-right">Jumlah</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t) => (
                    <tr key={t.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-600">{t.date}</td>
                      <td className="px-4 py-3 font-medium text-gray-800 text-xs">{t.projectName || "-"}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeBadge[t.type] || "bg-gray-100"}`}>
                          {TRANSACTION_TYPES[t.type] || t.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{t.description}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{CATEGORIES[t.category] || t.category}</td>
                      <td className="px-4 py-3 text-right font-medium">{formatRupiah(t.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
