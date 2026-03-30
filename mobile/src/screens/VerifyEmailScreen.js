import React, { useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text } from "react-native";
import { Screen } from "../components/Screen";
import { Card } from "../components/Card";
import { Input } from "../components/Input";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export function VerifyEmailScreen({ route, navigation }) {
  const { user, refreshUser } = useAuth();
  const initialEmail = useMemo(() => route.params?.email || user?.email || "", [route.params?.email, user?.email]);

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [requesting, setRequesting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [message, setMessage] = useState(
    route.params?.email ? "Verification OTP bhej diya gaya hai. OTP backend terminal ke mock email log me milega." : ""
  );

  const handleRequestOtp = async () => {
    try {
      setRequesting(true);
      setMessage("");
      await api.post("/auth/verify-email/request", { email });
      setMessage("Verification OTP bhej diya gaya hai. OTP backend terminal ke mock email log me check kijiye.");
    } catch (error) {
      Alert.alert("OTP send failed", error.message);
    } finally {
      setRequesting(false);
    }
  };

  const handleVerify = async () => {
    try {
      setVerifying(true);
      setMessage("");
      await api.post("/auth/verify-email", { email, otp });
      if (user) {
        await refreshUser();
      }
      setMessage("Email successfully verify ho gayi.");
      setTimeout(() => navigation.goBack(), 900);
    } catch (error) {
      Alert.alert("Verification failed", error.message);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <Screen>
      <Card>
        <Text style={styles.title}>Verify Email</Text>
        <Text style={styles.subtitle}>
          OTP based verification yahan se complete kariye. Demo mode me OTP backend terminal ke mock email log me show hota hai.
        </Text>
        <Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <Input label="6 digit OTP" value={otp} onChangeText={setOtp} keyboardType="number-pad" maxLength={6} />

        {message ? <Text style={styles.message}>{message}</Text> : null}

        <Pressable style={styles.secondaryButton} onPress={handleRequestOtp} disabled={requesting || !email}>
          <Text style={styles.secondaryButtonText}>{requesting ? "Sending OTP..." : "Send / Resend OTP"}</Text>
        </Pressable>
        <Pressable style={[styles.primaryButton, otp.length !== 6 && styles.buttonDisabled]} onPress={handleVerify} disabled={verifying || !email || otp.length !== 6}>
          <Text style={styles.primaryButtonText}>{verifying ? "Verifying..." : "Verify email"}</Text>
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
