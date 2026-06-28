import { useAuth } from "../../context/AuthContext";

export default function OwnerDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h1 className="font-bold text-gray-800">EWS Dashboard</h1>
              <p className="text-xs text-gray-500">Owner View</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.name}</span>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">Owner</span>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Proyek Aktif", value: "15", color: "blue" },
            { label: "Total Nilai PO", value: "Rp 5,36 M", color: "green" },
            { label: "Total Realisasi", value: "Rp 3,82 M", color: "yellow" },
            { label: "Sisa Anggaran", value: "Rp 1,54 M", color: "red" },
          ].map((card) => (
            <div key={card.label} className="bg-white rounded-xl shadow-sm p-5 border">
              <p className="text-sm text-gray-500">{card.label}</p>
              <p className={`text-2xl font-bold mt-1 text-${card.color}-600`}>{card.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="font-semibold text-lg mb-4">Status Proyek</h2>
          <p className="text-gray-500 text-sm">
            Daftar proyek dengan indikator EWS akan ditampilkan di Fase C.
          </p>
        </div>
      </main>
    </div>
  );
}
