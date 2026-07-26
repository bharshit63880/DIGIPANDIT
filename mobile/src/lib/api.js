import axios from "axios";
import { getAuthToken } from "./authStorage";

export const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://10.0.2.2:5000/api";

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(async (config) => {
  const token = await getAuthToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
