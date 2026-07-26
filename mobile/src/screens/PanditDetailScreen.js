import React, { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput } from "react-native";
import { Screen } from "../components/Screen";
import { Card } from "../components/Card";
import { api } from "../lib/api";

export function PanditDetailScreen({ route }) {
  const { panditId } = route.params;
  const [pandit, setPandit] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [scheduleAt, setScheduleAt] = useState("");

  useEffect(() => {
    const load = async () => {
      const response = await api.get(`/pandits/${panditId}`);
      setPandit(response.data.data);
    };

    load();
  }, [panditId]);

  const handleBook = async () => {
    if (!selectedService || !scheduleAt) {
      Alert.alert("Missing details", "Please choose a service and enter a schedule date/time.");
      return;
    }

    try {
      await api.post("/bookings", {
        panditProfileId: pandit._id,
        serviceId: selectedService._id,
        scheduleAt: new Date(scheduleAt).toISOString(),
        meetingMode: selectedService.category === "PUJA" ? "OFFLINE" : "ONLINE",
        address: {
          label: "Primary",
          line1: "Demo address",
          city: pandit.serviceCities?.[0] || "Delhi",
          state: pandit.user?.state || "Delhi",
          pincode: "110001",
        },
      });
      Alert.alert("Booking created", "Your booking was created. Complete payment from your account flow.");
    } catch (error) {
      Alert.alert("Booking failed", error.message);
    }
  };

  if (!pandit) {
    return <Screen><Text>Loading...</Text></Screen>;
  }

  return (
    <Screen>
      <Card>
        <Text style={styles.title}>{pandit.user?.name}</Text>
        <Text style={styles.subtitle}>{pandit.bio || "Trusted pandit profile with puja and astrology service options."}</Text>
      </Card>

      {pandit.services?.map((service) => (
        <Pressable
          key={service._id}
          onPress={() => setSelectedService(service)}
          style={[styles.serviceCard, selectedService?._id === service._id && styles.serviceCardActive]}
        >
          <Text style={styles.serviceTitle}>{service.name}</Text>
          <Text style={styles.subtitle}>Rs. {service.price} | {service.category}</Text>
        </Pressable>
      ))}

      <Card>
        <Text style={styles.serviceTitle}>Preferred date & time</Text>
        <TextInput
          placeholder="2026-04-15 10:30"
          value={scheduleAt}
          onChangeText={setScheduleAt}
          style={styles.input}
        />
        <Pressable style={styles.primaryButton} onPress={handleBook}>
          <Text style={styles.primaryButtonText}>Book now</Text>
        </Pressable>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: "800", color: "#202126" },
  subtitle: { marginTop: 8, color: "#5e6167", lineHeight: 21 },
  serviceCard: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#e8dac9",
  },
  serviceCardActive: {
    borderColor: "#7a2e1d",
    backgroundColor: "#fff6ef",
  },
  serviceTitle: { fontSize: 18, fontWeight: "800", color: "#202126" },
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
});
