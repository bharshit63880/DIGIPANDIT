import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

export function Input({ label, ...props }) {
  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput style={styles.input} placeholderTextColor="#8a7e78" {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginTop: 16 },
  label: { marginBottom: 8, color: "#202126", fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: "#e8dac9",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#fff",
    color: "#202126",
  },
});
