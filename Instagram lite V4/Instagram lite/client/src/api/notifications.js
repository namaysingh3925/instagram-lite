import apiClient from "./client";

export function getNotifications() {
  return apiClient.get("/notifications").then((res) => res.data);
}

export function markNotificationsRead() {
  return apiClient.put("/notifications/read").then((res) => res.data);
}
