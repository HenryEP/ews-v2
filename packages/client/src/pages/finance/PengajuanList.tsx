import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { get, put } from "../../api";
import { formatRupiah, CATEGORIES, PENGAJUAN_STATUSES } from "../../types";
import type { Pengajuan } from "../../types";

export default function FinancePengajuanList() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [pengajuanList, setPengajuanList] = useState<Pengajuan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPengajuan = () => {
    get<Pengajuan[]>("/api/pengajuan")
      .then(setPengajuanList)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(fetchPengajuan, []);

  async function handleStatus(id: number, status: string) {
    try {
      await put(`/api/pengajuan/${id}`, { status });
      fetchPengajuan();
    } catch (e: any) {
      setError(e.message);
    }
  }

  const statusBadge: Record<string, string> = {
    menunggu: "bg-yellow-100 text-yellow-700",
    disetujui: "bg-green-100 text-green-700",
    ditolak: "bg-red-100 text-red-700",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/finance")} className="text-gray-400 hover:text-gray-600 text-xl">&larr;</button>
            <div>
              <h1 className="font-bold text-gray-800">Pengajuan Site Manager</h1>
              <p className="text-xs text-gray-500">Review & approve pengajuan</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">{user?.name}</span>
            <button onClick={logout} className="text-sm text-red-600">Keluar</button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          {loading ? (
            <p className="text-center py-8 text-gray-500">Memuat...</p>
          ) : error ? (
            <p className="text-center py-8 text-red-500">{error}</p>
          ) : pengajuanList.length === 0 ? (
            <p className="text-center py-8 text-gray-400">Belum ada pengajuan</p>
          ) : (
            <div className="space-y-3">
              {pengajuanList.map((p) => (
                <div key={p.id} className="flex items-center justify-between border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-800">{p.description}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge[p.status]}`}>
                        {PENGAJUAN_STATUSES[p.status]}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {p.projectName} • {CATEGORIES[p.category]} • {formatRupiah(p.estimatedCost)} • oleh {p.siteManagerName}
                    </p>
                    {p.notes && <p className="text-xs text-gray-400 mt-1 italic">{p.notes}</p>}
                  </div>
                  {p.status === "menunggu" && (
                    <div className="flex gap-2 ml-4 shrink-0">
                      <button
                        onClick={() => handleStatus(p.id, "disetujui")}
                        className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700"
                      >
                        Setujui
                      </button>
                      <button
                        onClick={() => handleStatus(p.id, "ditolak")}
                        className="px-3 py-1.5 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600"
                      >
                        Tolak
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
