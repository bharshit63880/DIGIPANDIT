import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("digipandit_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("digipandit_token");
      localStorage.removeItem("digipandit_user");
      window.dispatchEvent(new CustomEvent("digipandit:auth-expired"));
    }

    const message = error.response?.data?.message || "Something went wrong";
    return Promise.reject(new Error(message));
  }
);
