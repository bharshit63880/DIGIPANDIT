import React, { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput } from "react-native";
import { Screen } from "../components/Screen";
import { Card } from "../components/Card";
import { useAuth } from "../context/AuthContext";

export function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });

  const handleLogin = async () => {
    try {
      await login(form);
    } catch (error) {
      Alert.alert("Login failed", error.message);
    }
  };

  return (
    <Screen>
      <Card>
        <Text style={styles.title}>Welcome to DigiPandit</Text>
        <Text style={styles.subtitle}>Login to browse pandits, manage bookings, and chat with experts.</Text>

        <TextInput placeholder="Email" style={styles.input} value={form.email} onChangeText={(email) => setForm({ ...form, email })} />
        <TextInput
          placeholder="Password"
          secureTextEntry
          style={styles.input}
          value={form.password}
          onChangeText={(password) => setForm({ ...form, password })}
        />

        <Pressable style={styles.primaryButton} onPress={handleLogin}>
          <Text style={styles.primaryButtonText}>Login</Text>
        </Pressable>

        <Pressable onPress={() => navigation.navigate("ForgotPassword", { email: form.email })}>
          <Text style={styles.link}>Forgot password?</Text>
        </Pressable>

        <Pressable onPress={() => navigation.navigate("VerifyEmail", { email: form.email })}>
          <Text style={styles.link}>Verify email</Text>
        </Pressable>

        <Pressable onPress={() => navigation.navigate("Register")}>
          <Text style={styles.link}>Create a new account</Text>
        </Pressable>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: "800", color: "#202126" },
  subtitle: { marginTop: 8, color: "#5e6167", lineHeight: 22 },
  input: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#e8dac9",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#fff",
  },
  primaryButton: {
    marginTop: 18,
    backgroundColor: "#7a2e1d",
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryButtonText: { color: "#fff", fontWeight: "700" },
  link: { marginTop: 14, color: "#7a2e1d", fontWeight: "700", textAlign: "center" },
});
