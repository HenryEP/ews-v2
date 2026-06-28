import { useAuth } from "../../context/AuthContext";

export default function SiteManagerDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏗️</span>
            <div>
              <h1 className="font-bold text-gray-800">EWS Site Manager</h1>
              <p className="text-xs text-gray-500">Site Manager View</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.name}</span>
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">Site Manager</span>
            <button
              onClick={logout}
              className="text-sm text-red-600 hover:text-red-800 cursor-pointer"
            >
              Keluar
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="font-semibold text-lg mb-4">Dashboard Site Manager</h2>
          <p className="text-gray-500 text-sm">
            Fitur pengajuan kebutuhan dan monitoring proyek akan ditampilkan di Fase C & D.
          </p>
        </div>
      </main>
    </div>
  );
}
