import React, { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput } from "react-native";
import { Screen } from "../components/Screen";
import { Card } from "../components/Card";
import { useAuth } from "../context/AuthContext";

export function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    city: "",
    state: "",
    role: "USER",
  });

  const handleRegister = async () => {
    try {
      await register(form);
      navigation.navigate("VerifyEmail", { email: form.email });
    } catch (error) {
      Alert.alert("Registration failed", error.message);
    }
  };

  return (
    <Screen>
      <Card>
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>Mobile access is focused on the user journey, but it uses the same backend auth.</Text>

        {["name", "email", "password", "city", "state"].map((field) => (
          <TextInput
            key={field}
            placeholder={field[0].toUpperCase() + field.slice(1)}
            secureTextEntry={field === "password"}
            style={styles.input}
            value={form[field]}
            onChangeText={(value) => setForm({ ...form, [field]: value })}
          />
        ))}

        <Pressable style={styles.primaryButton} onPress={handleRegister}>
          <Text style={styles.primaryButtonText}>Register</Text>
        </Pressable>

        <Pressable onPress={() => navigation.navigate("VerifyEmail", { email: form.email })}>
          <Text style={styles.link}>Verify email</Text>
        </Pressable>

        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.link}>Already have an account? Login</Text>
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
  link: { marginTop: 16, color: "#7a2e1d", fontWeight: "700", textAlign: "center" },
});
