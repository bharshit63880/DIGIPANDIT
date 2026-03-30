import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { Screen } from "../components/Screen";
import { Card } from "../components/Card";
import { useAuth } from "../context/AuthContext";

export function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();

  return (
    <Screen>
      <Card>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>{user?.name}</Text>
        <Text style={styles.copy}>{user?.email}</Text>
        <Text style={styles.copy}>{user?.city || "City not set"}</Text>
        <Text style={[styles.copy, user?.emailVerified ? styles.verifiedText : styles.unverifiedText]}>
          Email status: {user?.emailVerified ? "Verified" : "Not verified"}
        </Text>
      </Card>

      <Card>
        <Text style={styles.title}>Account actions</Text>
        {!user?.emailVerified ? (
          <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate("VerifyEmail", { email: user?.email })}>
            <Text style={styles.secondaryButtonText}>Verify email</Text>
          </Pressable>
        ) : null}
        <Pressable style={styles.primaryButton} onPress={logout}>
          <Text style={styles.primaryButtonText}>Logout</Text>
        </Pressable>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: "800", color: "#202126" },
  subtitle: { marginTop: 10, color: "#202126", fontWeight: "700", fontSize: 18 },
  copy: { marginTop: 4, color: "#5e6167" },
  verifiedText: { color: "#2f6f44", fontWeight: "700" },
  unverifiedText: { color: "#b85b32", fontWeight: "700" },
  secondaryButton: {
    marginTop: 16,
    backgroundColor: "#202126",
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
  },
  secondaryButtonText: { color: "#fff", fontWeight: "700" },
  primaryButton: {
    marginTop: 16,
    backgroundColor: "#7a2e1d",
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryButtonText: { color: "#fff", fontWeight: "700" },
});
