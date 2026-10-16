import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useNotifications } from "../context/NotificationContext";
import Avatar from "./Avatar";

function timeAgo(dateString) {
  const seconds = Math.floor((Date.now() - new Date(dateString)) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;

  return `${Math.floor(seconds / 86400)}d`;
}

export default function NotificationBell() {
  const { notifications, unreadCount, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (!containerRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function toggleOpen() {
    if (!isOpen) {
      markAllAsRead();
    }

    setIsOpen((prev) => !prev);
  }

  return (
    <div className="notification-bell" ref={containerRef}>
      <button
        className="bell-button"
        onClick={toggleOpen}
        aria-label="Notifications"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>

        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <h4>Notifications</h4>

          {notifications.length === 0 && (
            <p className="muted notification-empty">No notifications yet.</p>
          )}

          <ul>
            {notifications.map((notification) => (
              <li key={notification._id}>
                <Link
                  to={`/profile/${notification.sender?._id}`}
                  className={`notification-item ${notification.isRead ? "" : "unread"}`}
                  onClick={() => setIsOpen(false)}
                >
                  <Avatar src={notification.sender?.profilePicture} size={36} />
                  <span className="notification-text">
                    <strong>{notification.sender?.username}</strong>{" "}
                    {notification.type === "follow"
                      ? "started following you."
                      : "unfollowed you."}
                    <span className="muted"> {timeAgo(notification.createdAt)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
