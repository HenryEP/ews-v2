import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { get } from "../../api";
import { formatRupiah } from "../../types";
import type { DashboardProject } from "../../types";

export default function SiteManagerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState<DashboardProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    get<DashboardProject[]>("/api/dashboard/projects")
      .then((projects) => {
        if (projects.length > 0) setProject(projects[0]);
      })
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
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏗️</span>
            <div>
              <h1 className="font-bold text-gray-800">Dashboard Proyek</h1>
              <p className="text-xs text-gray-500">Site Manager View</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/site-manager/pengajuan")} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              📝 Pengajuan
            </button>
            <span className="text-sm text-gray-600">{user?.name}</span>
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">Site Manager</span>
            <button onClick={logout} className="text-sm text-red-600 hover:text-red-800 cursor-pointer">Keluar</button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-6">{error}</div>
        )}

        {!project ? (
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
            <p className="text-gray-500">Belum ada proyek yang ditugaskan.</p>
          </div>
        ) : (
          <>
            {/* Project Info */}
            <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
              <h2 className="font-semibold text-lg mb-4">{project.name}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Nilai PO</p>
                  <p className="font-semibold mt-1">{formatRupiah(project.poValue)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Budget</p>
                  <p className="font-semibold mt-1">{formatRupiah(project.budgetValue)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Realisasi</p>
                  <p className="font-semibold mt-1">{formatRupiah(project.realisasi)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Sisa</p>
                  <p className={`font-semibold mt-1 ${project.budgetValue - project.realisasi < 0 ? "text-red-600" : ""}`}>
                    {formatRupiah(project.budgetValue - project.realisasi)}
                  </p>
                </div>
              </div>
            </div>

            {/* EWS Status */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="font-semibold text-lg mb-4">Status Anggaran</h3>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Penyerapan Anggaran</span>
                  <span className="font-semibold">{project.percent}%</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${progressColor[project.ewsStatus] || "bg-gray-400"}`}
                    style={{ width: `${Math.min(project.percent, 100)}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Status EWS:</span>
                <span className={`text-sm px-3 py-1 rounded-full font-medium ${ewsBadge[project.ewsStatus] || "bg-gray-100"}`}>
                  {project.ewsLabel}
                </span>
              </div>
              <button
                onClick={() => navigate("/site-manager/pengajuan")}
                className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                Ajukan Kebutuhan
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
