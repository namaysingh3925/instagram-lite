import apiClient from "./client";

export function register(data) {
  return apiClient.post("/auth/register", data).then((res) => res.data);
}

export function login(data) {
  return apiClient.post("/auth/login", data).then((res) => res.data);
}
