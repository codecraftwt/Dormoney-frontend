import axios from "axios";
import { getToken } from "./storage";

// In dev, default to same-origin so Vite can proxy /api → backend (see vite.config.js).
// Set VITE_API_BASE_URL to override (e.g. http://localhost:5000 or your deployed API).
const baseURL =
  import.meta.env.VITE_API_BASE_URL ??
  (import.meta.env.DEV ? "" : "http://localhost:5000");

const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
