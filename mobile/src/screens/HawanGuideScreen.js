import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Screen } from "../components/Screen";
import { Card } from "../components/Card";
import {
  hawanCarePoints,
  hawanDressGuide,
  hawanFaqItems,
  hawanOptions,
  hawanQuickInfo,
  hawanSamagri,
  hawanSteps,
  pujanOptions,
} from "../lib/devotionalContent";

export function HawanGuideScreen({ navigation }) {
  const [activeHawanId, setActiveHawanId] = useState(hawanOptions[0].id);
  const [activePujanId, setActivePujanId] = useState(pujanOptions[0].id);

  const activeHawan = hawanOptions.find((item) => item.id === activeHawanId) || hawanOptions[0];
  const activePujan = pujanOptions.find((item) => item.id === activePujanId) || pujanOptions[0];

  return (
    <Screen>
      <Card>
        <Text style={styles.heroTitle}>Hawan Guide</Text>
        <Text style={styles.heroText}>
          Hawan kab karein, kaise karein, kya pehnein, kya dhyaan rakhein, aur saath me kaun sa pujan useful hota hai, sab yahan simple Hinglish me diya gaya hai.
        </Text>
        <View style={styles.ctaRow}>
          <Pressable style={styles.primaryButton} onPress={() => navigation.navigate("HomeList")}>
            <Text style={styles.primaryButtonText}>Pandit browse karo</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={() => navigation.getParent()?.navigate("Store")}>
            <Text style={styles.secondaryButtonText}>Puja Store</Text>
          </Pressable>
        </View>
      </Card>

      {hawanQuickInfo.map((item) => (
        <Card key={item.title}>
          <Text style={styles.sectionTitle}>{item.title}</Text>
          <Text style={styles.bodyText}>{item.text}</Text>
        </Card>
      ))}

      <Card>
        <Text style={styles.sectionTitle}>Hawan me kya kya chahiye</Text>
        {hawanSamagri.map((item) => (
          <Text key={item} style={styles.bulletText}>• {item}</Text>
        ))}
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Kaise karein step by step</Text>
        {hawanSteps.map((step, index) => (
          <View key={step} style={styles.stepRow}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>{index + 1}</Text>
            </View>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Kya pehne aur kaise baithein</Text>
        {hawanDressGuide.map((item) => (
          <Text key={item} style={styles.bulletText}>• {item}</Text>
        ))}
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Important safety aur dhyaan wali baatein</Text>
        {hawanCarePoints.map((item) => (
          <Text key={item} style={styles.bulletText}>• {item}</Text>
        ))}
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Popular Hawan</Text>
        <View style={styles.tabWrap}>
          {hawanOptions.map((option) => (
            <Pressable
              key={option.id}
              style={[styles.tabButton, activeHawan.id === option.id && styles.tabButtonActive]}
              onPress={() => setActiveHawanId(option.id)}
            >
              <Text style={[styles.tabText, activeHawan.id === option.id && styles.tabTextActive]}>{option.title}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.subHeading}>{activeHawan.subtitle}</Text>
        <Text style={styles.label}>Kab useful rehta hai</Text>
        <Text style={styles.bodyText}>{activeHawan.when}</Text>
        <Text style={styles.label}>Purpose</Text>
        <Text style={styles.bodyText}>{activeHawan.purpose}</Text>
        <Text style={styles.label}>Ye kin logon ke liye useful hai</Text>
        <View style={styles.badgeWrap}>
          {activeHawan.idealFor.map((item) => (
            <View key={item} style={styles.badge}>
              <Text style={styles.badgeText}>{item}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.label}>Important baatein</Text>
        {activeHawan.keyPoints.map((item) => (
          <Text key={item} style={styles.bulletText}>• {item}</Text>
        ))}
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Saath ke Pujan</Text>
        <View style={styles.tabWrap}>
          {pujanOptions.map((option) => (
            <Pressable
              key={option.id}
              style={[styles.tabButton, activePujan.id === option.id && styles.tabButtonActive]}
              onPress={() => setActivePujanId(option.id)}
            >
              <Text style={[styles.tabText, activePujan.id === option.id && styles.tabTextActive]}>{option.title}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.subHeading}>{activePujan.subtitle}</Text>
        <Text style={styles.label}>Kab karein</Text>
        <Text style={styles.bodyText}>{activePujan.when}</Text>
        <Text style={styles.label}>Purpose</Text>
        <Text style={styles.bodyText}>{activePujan.purpose}</Text>
        <Text style={styles.label}>Isme kya hota hai</Text>
        {activePujan.includes.map((item) => (
          <Text key={item} style={styles.bulletText}>• {item}</Text>
        ))}
        <Text style={styles.label}>Basic flow</Text>
        {activePujan.flow.map((item, index) => (
          <View key={item} style={styles.stepRow}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>{index + 1}</Text>
            </View>
            <Text style={styles.stepText}>{item}</Text>
          </View>
        ))}
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>FAQ</Text>
        {hawanFaqItems.map((item) => (
          <View key={item.question} style={styles.faqBlock}>
            <Text style={styles.question}>{item.question}</Text>
            <Text style={styles.bodyText}>{item.answer}</Text>
          </View>
        ))}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroTitle: { fontSize: 30, fontWeight: "800", color: "#202126" },
  heroText: { marginTop: 10, color: "#5e6167", lineHeight: 24 },
  ctaRow: { flexDirection: "row", gap: 10, marginTop: 18 },
  primaryButton: {
    flex: 1,
    backgroundColor: "#7a2e1d",
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryButtonText: { color: "#fff", fontWeight: "700" },
  secondaryButton: {
    flex: 1,
    backgroundColor: "#202126",
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
  },
  secondaryButtonText: { color: "#fff", fontWeight: "700" },
  sectionTitle: { fontSize: 24, fontWeight: "800", color: "#202126" },
  bodyText: { marginTop: 10, color: "#5e6167", lineHeight: 24 },
  bulletText: { marginTop: 10, color: "#5e6167", lineHeight: 24 },
  stepRow: { flexDirection: "row", gap: 12, marginTop: 14, alignItems: "flex-start" },
  stepBadge: {
    width: 30,
    height: 30,
    borderRadius: 999,
    backgroundColor: "#7a2e1d",
    alignItems: "center",
    justifyContent: "center",
  },
  stepBadgeText: { color: "#fff", fontWeight: "800" },
  stepText: { flex: 1, color: "#5e6167", lineHeight: 24 },
  tabWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 16 },
  tabButton: {
    backgroundColor: "#f8f1e8",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  tabButtonActive: {
    backgroundColor: "#7a2e1d",
  },
  tabText: { color: "#202126", fontWeight: "700" },
  tabTextActive: { color: "#fff" },
  subHeading: { marginTop: 16, color: "#b86b42", fontWeight: "700", lineHeight: 22 },
  label: { marginTop: 16, color: "#202126", fontWeight: "800" },
  badgeWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  badge: { backgroundColor: "#fff6ef", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  badgeText: { color: "#7a2e1d", fontWeight: "700", fontSize: 12 },
  faqBlock: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f1e4d5",
    paddingTop: 16,
  },
  question: { color: "#202126", fontWeight: "800", fontSize: 17, lineHeight: 24 },
});
