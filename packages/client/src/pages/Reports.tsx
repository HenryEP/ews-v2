import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { get } from "../api";
import type { Project } from "../types";

export default function ReportsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"summary" | "detail">("summary");
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    get<Project[]>("/api/projects").then(setProjects).catch(() => {});
  }, []);

  function download(path: string) {
    window.open(`/api/reports/${path}`, "_blank");
  }

  const project = projects.find((p) => p.id === selectedProject);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600 text-xl">&larr;</button>
            <div>
              <h1 className="font-bold text-gray-800">Laporan & Export</h1>
              <p className="text-xs text-gray-500">Download PDF / Excel</p>
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
          <button onClick={() => setTab("summary")} className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${tab === "summary" ? "bg-blue-600 text-white" : "text-gray-500"}`}>
            Ringkasan Semua Proyek
          </button>
          <button onClick={() => setTab("detail")} className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${tab === "detail" ? "bg-blue-600 text-white" : "text-gray-500"}`}>
            Detail Per Proyek
          </button>
        </div>

        {tab === "summary" ? (
          <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
            <div className="text-5xl mb-4">📊</div>
            <h2 className="font-semibold text-lg mb-2">Laporan Ringkasan Semua Proyek</h2>
            <p className="text-sm text-gray-500 mb-6">
              Mencakup semua proyek dengan status anggaran dan EWS
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => download("summary/pdf")}
                className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium flex items-center gap-2"
              >
                <span className="text-xl">📄</span> Download PDF
              </button>
              <button
                onClick={() => download("summary/excel")}
                className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium flex items-center gap-2"
              >
                <span className="text-xl">📊</span> Download Excel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Project Selection */}
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

            {/* Date Range */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Periode (opsional)</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Dari Tanggal</label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Sampai Tanggal</label>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-4 py-2 border rounded-lg" />
                </div>
              </div>
            </div>

            {/* Download Buttons */}
            {selectedProject && (
              <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
                <div className="text-2xl mb-2 font-semibold text-gray-800">{project?.name}</div>
                <p className="text-sm text-gray-500 mb-6">Detail proyek + riwayat transaksi</p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => {
                      const params = new URLSearchParams();
                      if (startDate) params.set("startDate", startDate);
                      if (endDate) params.set("endDate", endDate);
                      download(`project/${selectedProject}/pdf?${params.toString()}`);
                    }}
                    className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium flex items-center gap-2"
                  >
                    <span className="text-xl">📄</span> Download PDF
                  </button>
                  <button
                    onClick={() => {
                      const params = new URLSearchParams();
                      if (startDate) params.set("startDate", startDate);
                      if (endDate) params.set("endDate", endDate);
                      download(`project/${selectedProject}/excel?${params.toString()}`);
                    }}
                    className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium flex items-center gap-2"
                  >
                    <span className="text-xl">📊</span> Download Excel
                  </button>
                </div>
                {(startDate || endDate) && (
                  <p className="text-xs text-gray-400 mt-4">
                    Periode: {startDate || "awal"} s/d {endDate || "sekarang"}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
