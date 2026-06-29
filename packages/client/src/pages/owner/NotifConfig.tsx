import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { get, put } from "../../api";
import type { Project, NotifConfig } from "../../types";

export default function NotifConfig() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [configs, setConfigs] = useState<NotifConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    get<Project[]>("/api/projects").then(setProjects).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedProject) return;
    setLoading(true);
    get<NotifConfig[]>(`/api/notifications/config/${selectedProject}`)
      .then(setConfigs)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [selectedProject]);

  function toggle(level: string, field: "notifyOwner" | "notifyFinance" | "notifySm") {
    setConfigs((prev) =>
      prev.map((c) =>
        c.level === level ? { ...c, [field]: c[field] ? 0 : 1 } : c
      )
    );
  }

  async function handleSave() {
    if (!selectedProject) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await put(`/api/notifications/config/${selectedProject}`, { configs });
      setSuccess("Konfigurasi notifikasi disimpan!");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  const labels: Record<string, string> = {
    waspada: "🟡 Waspada", bahaya: "🟠 Bahaya", kritis: "🔴 Kritis", overrun: "💀 Overrun",
  };

  const project = projects.find((p) => p.id === selectedProject);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/owner")} className="text-gray-400 hover:text-gray-600 text-xl">&larr;</button>
            <div>
              <h1 className="font-bold text-gray-800">Konfigurasi Penerima Notifikasi</h1>
              <p className="text-xs text-gray-500">Tentukan siapa terima alert per level</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">{user?.name}</span>
            <button onClick={logout} className="text-sm text-red-600">Keluar</button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Proyek</label>
          <select value={selectedProject || ""} onChange={(e) => setSelectedProject(parseInt(e.target.value))} className="w-full px-4 py-2.5 border rounded-lg">
            <option value="">-- Pilih Proyek --</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        {loading && <p className="text-center py-4 text-gray-500">Memuat...</p>}
        {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">{error}</div>}
        {success && <div className="bg-green-50 text-green-600 text-sm px-4 py-3 rounded-lg">{success}</div>}

        {project && configs.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <p className="text-sm text-gray-500 mb-4">Proyek: <strong>{project.name}</strong></p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-3 font-medium">Level</th>
                    <th className="pb-3 font-medium text-center">Owner</th>
                    <th className="pb-3 font-medium text-center">Finance</th>
                    <th className="pb-3 font-medium text-center">Site Manager</th>
                  </tr>
                </thead>
                <tbody>
                  {configs.map((c) => (
                    <tr key={c.level} className="border-b">
                      <td className="py-3 font-medium">{labels[c.level] || c.level}</td>
                      <td className="py-3 text-center">
                        <button onClick={() => toggle(c.level, "notifyOwner")} className={`w-10 h-6 rounded-full transition ${c.notifyOwner ? "bg-blue-500" : "bg-gray-300"}`}>
                          <div className={`w-5 h-5 bg-white rounded-full shadow transition ml-0.5 ${c.notifyOwner ? "ml-auto mr-0.5" : ""}`} />
                        </button>
                      </td>
                      <td className="py-3 text-center">
                        <button onClick={() => toggle(c.level, "notifyFinance")} className={`w-10 h-6 rounded-full transition ${c.notifyFinance ? "bg-blue-500" : "bg-gray-300"}`}>
                          <div className={`w-5 h-5 bg-white rounded-full shadow transition ml-0.5 ${c.notifyFinance ? "ml-auto mr-0.5" : ""}`} />
                        </button>
                      </td>
                      <td className="py-3 text-center">
                        <button onClick={() => toggle(c.level, "notifySm")} className={`w-10 h-6 rounded-full transition ${c.notifySm ? "bg-blue-500" : "bg-gray-300"}`}>
                          <div className={`w-5 h-5 bg-white rounded-full shadow transition ml-0.5 ${c.notifySm ? "ml-auto mr-0.5" : ""}`} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button onClick={handleSave} disabled={saving} className="mt-6 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 font-medium">
              {saving ? "Menyimpan..." : "Simpan Konfigurasi"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
