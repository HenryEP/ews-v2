import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { get, put } from "../api";
import type { Notification } from "../types";

export default function NotificationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifs = () => {
    get<Notification[]>("/api/notifications")
      .then(setNotifs)
      .finally(() => setLoading(false));
  };

  useEffect(fetchNotifs, []);

  async function markRead(id: number) {
    await put(`/api/notifications/${id}/read`, {});
    fetchNotifs();
  }

  async function markAllRead() {
    await put("/api/notifications/read-all", {});
    fetchNotifs();
  }

  const levelBadge: Record<string, string> = {
    waspada: "bg-yellow-100 text-yellow-700",
    bahaya: "bg-orange-100 text-orange-700",
    kritis: "bg-red-100 text-red-700",
    overrun: "bg-red-200 text-red-900",
  };

  const labels: Record<string, string> = {
    waspada: "Waspada", bahaya: "Bahaya", kritis: "Kritis", overrun: "Overrun",
  };

  const unreadCount = notifs.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600 text-xl">&larr;</button>
            <div>
              <h1 className="font-bold text-gray-800">Notifikasi</h1>
              <p className="text-xs text-gray-500">{unreadCount} belum dibaca</p>
            </div>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-sm text-blue-600 hover:text-blue-800">
              Tandai semua dibaca
            </button>
          )}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {loading ? (
          <p className="text-center py-8 text-gray-500">Memuat...</p>
        ) : notifs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
            <p className="text-4xl mb-3">🔔</p>
            <p className="text-gray-500">Belum ada notifikasi</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifs.map((n) => (
              <div
                key={n.id}
                className={`bg-white rounded-xl shadow-sm border p-4 flex items-start justify-between cursor-pointer transition ${!n.isRead ? "border-l-4 border-l-blue-500" : "opacity-75"}`}
                onClick={() => !n.isRead && markRead(n.id)}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${levelBadge[n.level] || "bg-gray-100"}`}>
                      {labels[n.level] || n.level}
                    </span>
                    {!n.isRead && <span className="w-2 h-2 bg-blue-500 rounded-full" />}
                  </div>
                  <p className="text-sm text-gray-800">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {n.createdAt} • {n.projectName}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
