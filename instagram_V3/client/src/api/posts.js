import apiClient from "./client";

export function createPost(data) {
  return apiClient.post("/posts", data).then((res) => res.data);
}

export function getPost(postId) {
  return apiClient.get(`/posts/${postId}`).then((res) => res.data);
}

export function updatePost(postId, data) {
  return apiClient.put(`/posts/${postId}`, data).then((res) => res.data);
}

export function deletePost(postId) {
  return apiClient.delete(`/posts/${postId}`).then((res) => res.data);
}

export function likePost(postId) {
  return apiClient.post(`/posts/${postId}/like`).then((res) => res.data);
}

export function unlikePost(postId) {
  return apiClient.delete(`/posts/${postId}/like`).then((res) => res.data);
}

export function addComment(postId, text) {
  return apiClient
    .post(`/posts/${postId}/comments`, { text })
    .then((res) => res.data);
}

export function getComments(postId) {
  return apiClient.get(`/posts/${postId}/comments`).then((res) => res.data);
}

export function deleteComment(commentId) {
  return apiClient.delete(`/comments/${commentId}`).then((res) => res.data);
}
