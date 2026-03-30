import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://10.0.2.2:5000/api";

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("digipandit_mobile_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
