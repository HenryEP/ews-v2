import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { get, put } from "../../api";
import type { Project, ThresholdConfig } from "../../types";

export default function ThresholdConfig() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [thresholds, setThresholds] = useState<ThresholdConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [waspada, setWaspada] = useState(70);
  const [bahaya, setBahaya] = useState(85);
  const [kritis, setKritis] = useState(95);

  useEffect(() => {
    get<Project[]>("/api/projects")
      .then(setProjects)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedProject) return;
    setLoading(true);
    get<ThresholdConfig>(`/api/thresholds/${selectedProject}`)
      .then((t) => {
        setThresholds(t);
        setWaspada(t.waspada);
        setBahaya(t.bahaya);
        setKritis(t.kritis);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [selectedProject]);

  async function handleSave() {
    if (!selectedProject) return;
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const result = await put<ThresholdConfig>(`/api/thresholds/${selectedProject}`, {
        waspada, bahaya, kritis,
      });
      setThresholds(result);
      setSuccess("Threshold berhasil disimpan!");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  const project = projects.find((p) => p.id === selectedProject);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/owner")} className="text-gray-400 hover:text-gray-600 text-xl">&larr;</button>
            <div>
              <h1 className="font-bold text-gray-800">Konfigurasi Threshold EWS</h1>
              <p className="text-xs text-gray-500">Set level peringatan per proyek</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">{user?.name}</span>
            <button onClick={logout} className="text-sm text-red-600">Keluar</button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Proyek</label>
          <select
            value={selectedProject || ""}
            onChange={(e) => setSelectedProject(parseInt(e.target.value))}
            className="w-full px-4 py-2.5 border rounded-lg"
          >
            <option value="">-- Pilih Proyek --</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        {loading && <div className="text-center py-4 text-gray-500">Memuat threshold...</div>}

        {thresholds && project && (
          <div className="bg-white rounded-xl shadow-sm border p-6 space-y-6">
            <div>
              <p className="text-sm text-gray-500 mb-4">Proyek: <strong>{project.name}</strong></p>
              {thresholds.isDefaults && (
                <p className="text-xs text-yellow-600 bg-yellow-50 px-3 py-2 rounded-lg mb-4">
                  Menggunakan threshold default. Anda dapat menyesuaikan di bawah.
                </p>
              )}
            </div>

            {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">{error}</div>}
            {success && <div className="bg-green-50 text-green-600 text-sm px-4 py-3 rounded-lg">{success}</div>}

            <div className="space-y-5">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">🟡 Waspada (%)</label>
                  <span className="text-sm font-bold text-yellow-600">{waspada}%</span>
                </div>
                <input type="range" min={30} max={90} value={waspada} onChange={(e) => setWaspada(parseInt(e.target.value))} className="w-full" />
                <input type="number" value={waspada} onChange={(e) => setWaspada(parseInt(e.target.value) || 0)} className="w-20 mt-1 px-2 py-1 border rounded text-sm" />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">🟠 Bahaya (%)</label>
                  <span className="text-sm font-bold text-orange-600">{bahaya}%</span>
                </div>
                <input type="range" min={40} max={95} value={bahaya} onChange={(e) => setBahaya(parseInt(e.target.value))} className="w-full" />
                <input type="number" value={bahaya} onChange={(e) => setBahaya(parseInt(e.target.value) || 0)} className="w-20 mt-1 px-2 py-1 border rounded text-sm" />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">🔴 Kritis (%)</label>
                  <span className="text-sm font-bold text-red-600">{kritis}%</span>
                </div>
                <input type="range" min={50} max={100} value={kritis} onChange={(e) => setKritis(parseInt(e.target.value))} className="w-full" />
                <input type="number" value={kritis} onChange={(e) => setKritis(parseInt(e.target.value) || 0)} className="w-20 mt-1 px-2 py-1 border rounded text-sm" />
              </div>
            </div>

            <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 font-medium">
              {saving ? "Menyimpan..." : "Simpan Threshold"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
