import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { get, post } from "../../api";
import { formatRupiah } from "../../types";
import type { DashboardProject, SimulationPreview } from "../../types";

export default function SimulateNotif() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<DashboardProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [selectedLevel, setSelectedLevel] = useState("waspada");
  const [preview, setPreview] = useState<SimulationPreview | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    get<DashboardProject[]>("/api/dashboard/projects").then(setProjects).catch(() => {});
  }, []);

  const project = projects.find((p) => p.id === selectedProject);

  async function generatePreview() {
    if (!selectedProject || !project) return;
    setLoading(true);
    try {
      const result = await post<SimulationPreview>("/api/notifications/simulate", {
        projectId: selectedProject,
        level: selectedLevel,
        percent: project.percent,
      });
      setPreview(result);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  const levels = [
    { value: "waspada", label: "🟡 Waspada", color: "border-yellow-500 bg-yellow-50" },
    { value: "bahaya", label: "🟠 Bahaya", color: "border-orange-500 bg-orange-50" },
    { value: "kritis", label: "🔴 Kritis", color: "border-red-500 bg-red-50" },
    { value: "overrun", label: "💀 Overrun", color: "border-red-700 bg-red-100" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/owner")} className="text-gray-400 hover:text-gray-600 text-xl">&larr;</button>
            <div>
              <h1 className="font-bold text-gray-800">Simulasi Notifikasi</h1>
              <p className="text-xs text-gray-500">Preview pesan WhatsApp & Email</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">{user?.name}</span>
            <button onClick={logout} className="text-sm text-red-600">Keluar</button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Proyek</label>
              <select value={selectedProject || ""} onChange={(e) => setSelectedProject(parseInt(e.target.value))} className="w-full px-4 py-2.5 border rounded-lg">
                <option value="">-- Pilih Proyek --</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.percent}%)</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Level Alert</label>
              <select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)} className="w-full px-4 py-2.5 border rounded-lg">
                {levels.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>
          </div>
          <button onClick={generatePreview} disabled={loading || !selectedProject} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 text-sm">
            {loading ? "Memproses..." : "Generate Preview"}
          </button>
        </div>

        {preview && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* WhatsApp Preview */}
            <div>
              <h3 className="font-semibold text-sm text-gray-500 mb-3">📱 Simulasi WhatsApp</h3>
              <div className="bg-[#e5ddd5] rounded-xl p-4 shadow-inner">
                <div className="bg-white rounded-lg p-4 shadow max-w-xs ml-auto">
                  <p className="text-sm whitespace-pre-line text-gray-800 leading-relaxed">{preview.waMessage}</p>
                  <p className="text-xs text-gray-400 text-right mt-2">Baru saja</p>
                </div>
              </div>
            </div>

            {/* Email Preview */}
            <div>
              <h3 className="font-semibold text-sm text-gray-500 mb-3">📧 Simulasi Email</h3>
              <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <div className="bg-gray-100 px-4 py-2 border-b text-xs text-gray-500">
                  <p><strong>Subject:</strong> {preview.emailSubject}</p>
                  <p><strong>To:</strong> penerima@perusahaan.com</p>
                </div>
                <div className="p-4 text-sm" dangerouslySetInnerHTML={{ __html: preview.emailBody }} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
