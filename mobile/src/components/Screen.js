import React from "react";
import { SafeAreaView, ScrollView, StyleSheet, View } from "react-native";

export function Screen({ children, scroll = true }) {
  const Wrapper = scroll ? ScrollView : View;

  return (
    <SafeAreaView style={styles.safe}>
      <Wrapper contentContainerStyle={styles.content}>{children}</Wrapper>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f8f1e8",
  },
  content: {
    padding: 20,
    gap: 16,
  },
});
