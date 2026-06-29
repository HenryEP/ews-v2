import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { get, post } from "../../api";
import { TRANSACTION_TYPES, CATEGORIES } from "../../types";
import type { Project } from "../../types";

export default function FinanceTransaksi() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState("");
  const [type, setType] = useState("po");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [vendor, setVendor] = useState("");
  const [category, setCategory] = useState("material");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    get<Project[]>("/api/projects").then(setProjects).catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      await post("/api/transaksi", {
        projectId: parseInt(projectId),
        type,
        amount: parseInt(amount),
        date,
        vendor: vendor || null,
        category,
        description,
      });
      setAmount("");
      setVendor("");
      setDescription("");
      setSuccess("Transaksi berhasil dicatat! Realisasi proyek diperbarui.");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/finance")} className="text-gray-400 hover:text-gray-600 text-xl">&larr;</button>
            <div>
              <h1 className="font-bold text-gray-800">Input Transaksi</h1>
              <p className="text-xs text-gray-500">Catat realisasi pengeluaran</p>
            </div>
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
          {success && <div className="bg-green-50 text-green-600 text-sm px-4 py-3 rounded-lg">{success}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Proyek *</label>
            <select required value={projectId} onChange={(e) => setProjectId(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg">
              <option value="">-- Pilih Proyek --</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipe Transaksi *</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(TRANSACTION_TYPES).map(([k, v]) => (
                <label key={k} className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg cursor-pointer transition ${type === k ? "border-blue-500 bg-blue-50" : "hover:bg-gray-50"}`}>
                  <input type="radio" name="type" checked={type === k} onChange={() => setType(k)} />
                  <span className="text-sm">{v}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah (Rp) *</label>
              <input required type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg" placeholder="10000000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal *</label>
              <input required type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vendor / Penerima</label>
              <input value={vendor} onChange={(e) => setVendor(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg" placeholder="PT Maju Jaya (opsional)" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategori *</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg">
                {Object.entries(CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi *</label>
            <textarea required value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full px-4 py-2.5 border rounded-lg" placeholder="Detail pengeluaran..." />
          </div>

          <button type="submit" disabled={submitting} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 font-medium">
            {submitting ? "Menyimpan..." : "Catat Transaksi"}
          </button>
        </form>
      </main>
    </div>
  );
}
