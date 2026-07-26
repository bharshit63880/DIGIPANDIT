import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../lib/api";
import { AUTH_USER_KEY, clearAuthToken, getAuthToken, saveAuthToken } from "../lib/authStorage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const savedToken = await getAuthToken();
      const savedUser = await AsyncStorage.getItem(AUTH_USER_KEY);

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }

      setLoading(false);
    };

    restoreSession();
  }, []);

  const login = async (payload) => {
    const response = await api.post("/auth/login", payload);
    const { token: accessToken, user: currentUser } = response.data.data;

    await saveAuthToken(accessToken);
    await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(currentUser));
    setToken(accessToken);
    setUser(currentUser);
  };

  const register = async (payload) => {
    const response = await api.post("/auth/register", payload);
    const { token: accessToken, user: currentUser } = response.data.data;

    await saveAuthToken(accessToken);
    await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(currentUser));
    setToken(accessToken);
    setUser(currentUser);
  };

  const refreshUser = async () => {
    const response = await api.get("/users/me");
    const currentUser = response.data.data;
    await AsyncStorage.setItem(AUTH_USER_KEY, JSON.stringify(currentUser));
    setUser(currentUser);
    return currentUser;
  };

  const logout = async () => {
    await clearAuthToken();
    await AsyncStorage.removeItem(AUTH_USER_KEY);
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(user && token),
      login,
      register,
      refreshUser,
      logout,
    }),
    [loading, token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
