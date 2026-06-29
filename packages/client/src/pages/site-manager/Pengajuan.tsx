import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { get, post } from "../../api";
import { formatRupiah, CATEGORIES, PENGAJUAN_STATUSES } from "../../types";
import type { Pengajuan, Project } from "../../types";

export default function SiteManagerPengajuan() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"list" | "form">("list");
  const [pengajuanList, setPengajuanList] = useState<Pengajuan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form state
  const [description, setDescription] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");
  const [category, setCategory] = useState("material");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    get<Pengajuan[]>("/api/pengajuan")
      .then(setPengajuanList)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setSuccess("");
    setSubmitting(true);
    try {
      await post("/api/pengajuan", {
        projectId: user?.projectId,
        description,
        estimatedCost: parseInt(estimatedCost),
        category,
        notes: notes || null,
      });
      setDescription("");
      setEstimatedCost("");
      setNotes("");
      setSuccess("Pengajuan berhasil dikirim!");
      // Refresh list
      const list = await get<Pengajuan[]>("/api/pengajuan");
      setPengajuanList(list);
    } catch (e: any) {
      setFormError(e.message);
    } finally {
      setSubmitting(false);
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
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/site-manager")} className="text-gray-400 hover:text-gray-600 text-xl">&larr;</button>
            <div>
              <h1 className="font-bold text-gray-800">Pengajuan Kebutuhan</h1>
              <p className="text-xs text-gray-500">Ajukan material, jasa, alat</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">{user?.name}</span>
            <button onClick={logout} className="text-sm text-red-600">Keluar</button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl shadow-sm border p-1 mb-6">
          <button onClick={() => setTab("list")} className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${tab === "list" ? "bg-blue-600 text-white" : "text-gray-500 hover:text-gray-700"}`}>
            Daftar Pengajuan
          </button>
          <button onClick={() => setTab("form")} className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${tab === "form" ? "bg-blue-600 text-white" : "text-gray-500 hover:text-gray-700"}`}>
            Ajukan Baru
          </button>
        </div>

        {tab === "list" ? (
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
                  <div key={p.id} className="flex items-start justify-between border-b pb-3">
                    <div>
                      <p className="font-medium text-gray-800">{p.description}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {CATEGORIES[p.category]} • {formatRupiah(p.estimatedCost)}
                        {p.projectName && ` • ${p.projectName}`}
                      </p>
                      {p.notes && <p className="text-xs text-gray-400 mt-1 italic">{p.notes}</p>}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ml-2 shrink-0 ${statusBadge[p.status]}`}>
                      {PENGAJUAN_STATUSES[p.status]}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border p-6 space-y-5">
            <h2 className="font-semibold text-lg">Ajukan Kebutuhan Baru</h2>
            {formError && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">{formError}</div>}
            {success && <div className="bg-green-50 text-green-600 text-sm px-4 py-3 rounded-lg">{success}</div>}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Kebutuhan *</label>
              <input required value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Contoh: Pembelian semen 50 sak" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estimasi Biaya (Rp) *</label>
                <input required type="number" value={estimatedCost} onChange={(e) => setEstimatedCost(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg" placeholder="5000000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori *</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg">
                  {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catatan Tambahan</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full px-4 py-2.5 border rounded-lg" placeholder="Info tambahan..." />
            </div>

            <button type="submit" disabled={submitting} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 font-medium">
              {submitting ? "Mengirim..." : "Kirim Pengajuan"}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
