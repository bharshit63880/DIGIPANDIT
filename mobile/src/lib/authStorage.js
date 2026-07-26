import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

export const AUTH_TOKEN_KEY = "digipandit_mobile_token";
export const AUTH_USER_KEY = "digipandit_mobile_user";

export async function getAuthToken() {
  const secureToken = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
  if (secureToken) {
    return secureToken;
  }

  // One-time migration from releases that kept tokens in unencrypted storage.
  const legacyToken = await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  if (legacyToken) {
    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, legacyToken);
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
  }

  return legacyToken;
}

export const saveAuthToken = (token) => SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);

export async function clearAuthToken() {
  await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
  await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
}
