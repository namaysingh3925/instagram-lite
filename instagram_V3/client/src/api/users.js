import apiClient from "./client";

export function searchUsers(query) {
  return apiClient
    .get("/users/search", { params: { q: query } })
    .then((res) => res.data);
}

export function getUserProfile(userId) {
  return apiClient.get(`/users/${userId}`).then((res) => res.data);
}

export function updateUserProfile(userId, data) {
  return apiClient.put(`/users/${userId}`, data).then((res) => res.data);
}

export function followUser(userId) {
  return apiClient.post(`/users/${userId}/follow`).then((res) => res.data);
}

export function unfollowUser(userId) {
  return apiClient.delete(`/users/${userId}/follow`).then((res) => res.data);
}
