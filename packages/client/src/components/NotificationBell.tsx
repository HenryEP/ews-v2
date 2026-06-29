import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { get } from "../api";

export default function NotificationBell() {
  const [count, setCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    get<{ count: number }>("/api/notifications/unread-count")
      .then((d) => setCount(d.count))
      .catch(() => {});
  }, []);

  // Refresh count every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      get<{ count: number }>("/api/notifications/unread-count")
        .then((d) => setCount(d.count))
        .catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <button
      onClick={() => navigate("/notifications")}
      className="relative text-gray-500 hover:text-gray-700 transition"
      title="Notifikasi"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      {count > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}
