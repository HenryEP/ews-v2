import { useAuth } from "../../context/AuthContext";

export default function FinanceDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💰</span>
            <div>
              <h1 className="font-bold text-gray-800">EWS Finance</h1>
              <p className="text-xs text-gray-500">Finance View</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.name}</span>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Finance</span>
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
          <h2 className="font-semibold text-lg mb-4">Dashboard Finance</h2>
          <p className="text-gray-500 text-sm">
            Fitur input transaksi dan monitoring akan ditampilkan di Fase D.
          </p>
        </div>
      </main>
    </div>
  );
}
