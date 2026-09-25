import apiClient from "./client";

export function getFeed() {
  return apiClient.get("/feed").then((res) => res.data);
}
