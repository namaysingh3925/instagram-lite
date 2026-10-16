import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { getNotifications, markNotificationsRead } from "../api/notifications";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext(null);

const SOCKET_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"
).replace(/\/api\/?$/, "");

export function NotificationProvider({ children }) {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!token) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    getNotifications().then((data) => {
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    });

    const socket = io(SOCKET_URL, { auth: { token } });

    socket.on("notification", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((count) => count + 1);
    });

    return () => socket.disconnect();
  }, [token]);

  async function markAllAsRead() {
    if (unreadCount === 0) {
      return;
    }

    setUnreadCount(0);
    await markNotificationsRead();
  }

  const value = {
    notifications,
    unreadCount,
    markAllAsRead
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }

  return context;
}
