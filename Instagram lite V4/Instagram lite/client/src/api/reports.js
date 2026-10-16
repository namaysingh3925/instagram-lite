import apiClient from "./client";

export function reportPost(postId) {
  return apiClient.post(`/posts/${postId}/report`).then((res) => res.data);
}

export function getReportedPosts() {
  return apiClient.get("/reports").then((res) => res.data);
}

export function markPostSafe(postId) {
  return apiClient
    .put(`/reports/posts/${postId}/safe`)
    .then((res) => res.data);
}

export function deleteReportedPost(postId) {
  return apiClient.delete(`/reports/posts/${postId}`).then((res) => res.data);
}
