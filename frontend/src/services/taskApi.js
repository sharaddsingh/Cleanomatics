import axios from "axios";
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "",
  timeout: 10000,
});
export const taskApi = {
  list: () => api.get("/api/tasks").then((r) => r.data),
  get: (id) => api.get(`/api/tasks/${id}`).then((r) => r.data),
  create: (data) => api.post("/api/tasks", data).then((r) => r.data),
  update: (id, data) => api.put(`/api/tasks/${id}`, data).then((r) => r.data),
  remove: (id) => api.delete(`/api/tasks/${id}`).then((r) => r.data),
};
export function errorMessage(error) {
  return (
    error.response?.data?.errors
      ?.map((e) => `${e.field.replace("body.", "")}: ${e.message}`)
      .join(". ") ||
    error.response?.data?.message ||
    error.response?.data?.detail ||
    "Could not reach the server. Check that the backend is running and try again."
  );
}
