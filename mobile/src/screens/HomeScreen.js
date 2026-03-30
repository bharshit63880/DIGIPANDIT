import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Screen } from "../components/Screen";
import { Card } from "../components/Card";
import { api } from "../lib/api";

export function HomeScreen({ navigation }) {
  const [pandits, setPandits] = useState([]);
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(true);

  const loadPandits = async () => {
    setLoading(true);
    try {
      const response = await api.get("/pandits", { params: city ? { city } : {} });
      setPandits(response.data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPandits();
  }, []);

  return (
    <Screen>
      <Card>
        <Text style={styles.title}>Browse pandits</Text>
        <Text style={styles.subtitle}>Filter by city and open a profile to create a booking.</Text>
        <View style={styles.row}>
          <TextInput placeholder="City" style={[styles.input, { flex: 1, marginTop: 0 }]} value={city} onChangeText={setCity} />
          <Pressable style={styles.filterButton} onPress={loadPandits}>
            <Text style={styles.filterButtonText}>Search</Text>
          </Pressable>
        </View>
        <Pressable style={styles.aartiButton} onPress={() => navigation.navigate("AartiChalisa")}>
          <Text style={styles.aartiButtonText}>Open Aarti / Chalisa</Text>
        </Pressable>
        <Pressable style={styles.hawanButton} onPress={() => navigation.navigate("HawanGuide")}>
          <Text style={styles.hawanButtonText}>Open Hawan Guide</Text>
        </Pressable>
        <Pressable style={styles.storeButton} onPress={() => navigation.getParent()?.navigate("Store")}>
          <Text style={styles.storeButtonText}>Open Puja Store</Text>
        </Pressable>
      </Card>

      {loading ? <ActivityIndicator size="large" color="#7a2e1d" /> : null}

      {pandits.map((pandit) => (
        <Pressable key={pandit._id} onPress={() => navigation.navigate("PanditDetail", { panditId: pandit._id })}>
          <Card>
            <Text style={styles.cardTitle}>{pandit.user?.name}</Text>
            <Text style={styles.subtitle}>{pandit.serviceCities?.join(", ") || "Multiple cities"}</Text>
            <Text style={styles.copy}>{pandit.bio || "Experienced pandit for ceremonies and consultations."}</Text>
          </Card>
        </Pressable>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 26, fontWeight: "800", color: "#202126" },
  subtitle: { marginTop: 6, color: "#5e6167", lineHeight: 20 },
  copy: { marginTop: 10, color: "#202126", lineHeight: 22 },
  input: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#e8dac9",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#fff",
  },
  row: { flexDirection: "row", gap: 12, marginTop: 16, alignItems: "center" },
  filterButton: {
    backgroundColor: "#7a2e1d",
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  filterButtonText: { color: "#fff", fontWeight: "700" },
  cardTitle: { fontSize: 22, fontWeight: "800", color: "#202126" },
  aartiButton: {
    marginTop: 18,
    backgroundColor: "#7a2e1d",
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
  },
  aartiButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  storeButton: {
    marginTop: 12,
    backgroundColor: "#202126",
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
  },
  storeButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  hawanButton: {
    marginTop: 12,
    backgroundColor: "#b86b42",
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
  },
  hawanButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
