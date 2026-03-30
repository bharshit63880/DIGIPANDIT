import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Screen } from "../components/Screen";
import { Card } from "../components/Card";
import { aartiChalisaLibrary } from "../lib/devotionalContent";

export function AartiChalisaScreen({ navigation }) {
  const [mode, setMode] = useState("aarti");
  const [selected, setSelected] = useState({
    aarti: null,
    chalisa: null,
  });

  const items = aartiChalisaLibrary[mode];
  const activeId = selected[mode] || items[0]?.id;
  const activeItem = useMemo(() => items.find((item) => item.id === activeId) || null, [items, activeId]);

  return (
    <Screen>
      <Card>
        <Text style={styles.title}>Aarti aur Chalisa</Text>
        <Text style={styles.subtitle}>Popular devotional paath easy reading format me yahan milenge.</Text>
        <View style={styles.tabWrap}>
          {[
            { id: "aarti", label: "Aarti" },
            { id: "chalisa", label: "Chalisa" },
          ].map((tab) => (
            <Pressable
              key={tab.id}
              style={[styles.tabButton, mode === tab.id && styles.tabButtonActive]}
              onPress={() => setMode(tab.id)}
            >
              <Text style={[styles.tabText, mode === tab.id && styles.tabTextActive]}>{tab.label}</Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Paath select kijiye</Text>
        <View style={styles.tabWrap}>
          {items.map((item) => (
            <Pressable
              key={item.id}
              style={[styles.choiceButton, activeId === item.id && styles.choiceButtonActive]}
              onPress={() => setSelected((current) => ({ ...current, [mode]: item.id }))}
            >
              <Text style={[styles.choiceText, activeId === item.id && styles.choiceTextActive]}>{item.title}</Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>{activeItem?.title}</Text>
        <Text style={styles.metaText}>{activeItem?.deity} • {activeItem?.timing}</Text>
        <Text style={styles.text}>{activeItem?.text}</Text>
      </Card>

      <View style={styles.footer}>
        <Pressable style={styles.secondaryButton} onPress={() => navigation.navigate("HawanGuide")}>
          <Text style={styles.secondaryButtonText}>Open Hawan Guide</Text>
        </Pressable>
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Back to Home</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: "800", color: "#202126" },
  subtitle: { marginTop: 8, color: "#5e6167", lineHeight: 20 },
  sectionTitle: { fontSize: 22, fontWeight: "700", color: "#7a2e1d", marginBottom: 12 },
  metaText: { color: "#5e6167", lineHeight: 22, marginBottom: 14 },
  text: { color: "#202126", lineHeight: 24, fontSize: 16 },
  footer: { marginTop: 8, gap: 12, alignItems: "stretch" },
  backButton: {
    backgroundColor: "#7a2e1d",
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: "center",
  },
  backButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  secondaryButton: {
    backgroundColor: "#202126",
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: "center",
  },
  secondaryButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  tabWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14 },
  tabButton: {
    backgroundColor: "#f8f1e8",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  tabButtonActive: { backgroundColor: "#7a2e1d" },
  tabText: { color: "#202126", fontWeight: "700" },
  tabTextActive: { color: "#fff" },
  choiceButton: {
    backgroundColor: "#fff6ef",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  choiceButtonActive: { backgroundColor: "#7a2e1d" },
  choiceText: { color: "#202126", fontWeight: "700" },
  choiceTextActive: { color: "#fff" },
});
