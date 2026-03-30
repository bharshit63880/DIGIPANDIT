import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const savedToken = await AsyncStorage.getItem("digipandit_mobile_token");
      const savedUser = await AsyncStorage.getItem("digipandit_mobile_user");

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

    await AsyncStorage.setItem("digipandit_mobile_token", accessToken);
    await AsyncStorage.setItem("digipandit_mobile_user", JSON.stringify(currentUser));
    setToken(accessToken);
    setUser(currentUser);
  };

  const register = async (payload) => {
    const response = await api.post("/auth/register", payload);
    const { token: accessToken, user: currentUser } = response.data.data;

    await AsyncStorage.setItem("digipandit_mobile_token", accessToken);
    await AsyncStorage.setItem("digipandit_mobile_user", JSON.stringify(currentUser));
    setToken(accessToken);
    setUser(currentUser);
  };

  const refreshUser = async () => {
    const response = await api.get("/users/me");
    const currentUser = response.data.data;
    await AsyncStorage.setItem("digipandit_mobile_user", JSON.stringify(currentUser));
    setUser(currentUser);
    return currentUser;
  };

  const logout = async () => {
    await AsyncStorage.removeItem("digipandit_mobile_token");
    await AsyncStorage.removeItem("digipandit_mobile_user");
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
