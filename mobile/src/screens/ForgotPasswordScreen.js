import React, { useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text } from "react-native";
import { Screen } from "../components/Screen";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { api } from "../lib/api";

export function ForgotPasswordScreen({ route, navigation }) {
  const presetEmail = useMemo(() => route.params?.email || "", [route.params?.email]);
  const [email, setEmail] = useState(presetEmail);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [requesting, setRequesting] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [message, setMessage] = useState("");

  const handleRequestOtp = async () => {
    try {
      setRequesting(true);
      setMessage("");
      await api.post("/auth/forgot-password", { email });
      setMessage("Password reset OTP bhej diya gaya hai. OTP backend terminal ke mock email log me check kijiye.");
    } catch (error) {
      Alert.alert("OTP send failed", error.message);
    } finally {
      setRequesting(false);
    }
  };

  const handleReset = async () => {
    try {
      setResetting(true);
      setMessage("");
      await api.post("/auth/reset-password", { email, otp, newPassword });
      setMessage("Password reset ho gaya. Ab new password se login kijiye.");
      setTimeout(() => navigation.navigate("Login"), 900);
    } catch (error) {
      Alert.alert("Reset failed", error.message);
    } finally {
      setResetting(false);
    }
  };

  return (
    <Screen>
      <Card>
        <Text style={styles.title}>Forgot Password</Text>
        <Text style={styles.subtitle}>
          Email OTP ke through password reset kariye. Demo mode me OTP backend terminal ke mock email log me show hota hai.
        </Text>
        <Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <Input label="6 digit OTP" value={otp} onChangeText={setOtp} keyboardType="number-pad" maxLength={6} />
        <Input label="New password" value={newPassword} onChangeText={setNewPassword} secureTextEntry />

        {message ? <Text style={styles.message}>{message}</Text> : null}

        <Pressable style={styles.secondaryButton} onPress={handleRequestOtp} disabled={requesting || !email}>
          <Text style={styles.secondaryButtonText}>{requesting ? "Sending OTP..." : "Send / Resend OTP"}</Text>
        </Pressable>
        <Pressable
          style={[styles.primaryButton, (otp.length !== 6 || newPassword.length < 6) && styles.buttonDisabled]}
          onPress={handleReset}
          disabled={resetting || !email || otp.length !== 6 || newPassword.length < 6}
        >
          <Text style={styles.primaryButtonText}>{resetting ? "Resetting..." : "Reset password"}</Text>
        </Pressable>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: "800", color: "#202126" },
  subtitle: { marginTop: 8, color: "#5e6167", lineHeight: 22 },
  message: { marginTop: 14, color: "#2f6f44", lineHeight: 21 },
  primaryButton: {
    marginTop: 14,
    backgroundColor: "#7a2e1d",
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
  },
  secondaryButton: {
    marginTop: 18,
    backgroundColor: "#202126",
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.5 },
  primaryButtonText: { color: "#fff", fontWeight: "700" },
  secondaryButtonText: { color: "#fff", fontWeight: "700" },
});
