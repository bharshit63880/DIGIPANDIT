import React, { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Screen } from "../components/Screen";
import { Card } from "../components/Card";
import { useCart } from "../context/CartContext";
import { api } from "../lib/api";
import { payEntity } from "../lib/payments";
import { useAuth } from "../context/AuthContext";

export function CartScreen() {
  const { user } = useAuth();
  const { items, summary, updateQuantity, removeFromCart, clearCart } = useCart();
  const [paying, setPaying] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    label: "Ghar",
    line1: "Demo address",
    city: user?.city || "Delhi",
    state: user?.state || "Delhi",
    pincode: "110001",
  });

  const handleCheckout = async () => {
    if (!items.length) {
      return;
    }

    if (!shippingAddress.line1 || !shippingAddress.city || !shippingAddress.state || !shippingAddress.pincode) {
      Alert.alert("Address missing", "Checkout se pehle delivery address complete kijiye.");
      return;
    }

    try {
      setPaying(true);
      const response = await api.post("/store/orders", {
        items: items.map((item) => ({ productId: item._id, quantity: item.quantity })),
        shippingAddress,
      });

      await payEntity({
        entityType: "STORE_ORDER",
        entityId: response.data.data._id,
      });

      clearCart();
      Alert.alert("Order placed", "Aapka order create ho gaya aur payment complete ho gayi.");
    } catch (error) {
      Alert.alert("Checkout failed", error.message);
    } finally {
      setPaying(false);
    }
  };

  return (
    <Screen>
      <Card>
        <Text style={styles.title}>Cart</Text>
        <Text style={styles.subtitle}>Yahan se aap puja saman ka order place karke payment kar sakte hain.</Text>
      </Card>

      {items.length ? (
        items.map((item) => (
          <Card key={item._id}>
            <Text style={styles.itemTitle}>{item.name}</Text>
            <Text style={styles.itemSubtitle}>Rs. {item.price} each</Text>
            <View style={styles.itemRow}>
              <View style={styles.qtyRow}>
                <Pressable style={styles.qtyButton} onPress={() => updateQuantity(item._id, item.quantity - 1)}>
                  <Text style={styles.qtyButtonText}>-</Text>
                </Pressable>
                <Text style={styles.qtyValue}>{item.quantity}</Text>
                <Pressable style={styles.qtyButton} onPress={() => updateQuantity(item._id, item.quantity + 1)}>
                  <Text style={styles.qtyButtonText}>+</Text>
                </Pressable>
              </View>
              <Pressable onPress={() => removeFromCart(item._id)}>
                <Text style={styles.removeText}>Remove</Text>
              </Pressable>
            </View>
          </Card>
        ))
      ) : (
        <Card>
          <Text style={styles.emptyText}>Cart abhi khaali hai. Store se products add kijiye.</Text>
        </Card>
      )}

      <Card>
        <Text style={styles.sectionTitle}>Delivery address</Text>
        {[
          ["label", "Address label"],
          ["line1", "Line 1"],
          ["city", "City"],
          ["state", "State"],
          ["pincode", "Pincode"],
        ].map(([key, placeholder]) => (
          <TextInput
            key={key}
            placeholder={placeholder}
            value={shippingAddress[key]}
            onChangeText={(value) => setShippingAddress((current) => ({ ...current, [key]: value }))}
            style={styles.input}
          />
        ))}
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Order summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>Rs. {summary.subtotal}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Shipping</Text>
          <Text style={styles.summaryValue}>Rs. {summary.shipping}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryTotalLabel}>Total</Text>
          <Text style={styles.summaryTotalValue}>Rs. {summary.total}</Text>
        </View>
        <Pressable style={[styles.primaryButton, !items.length && styles.primaryButtonDisabled]} disabled={!items.length || paying} onPress={handleCheckout}>
          <Text style={styles.primaryButtonText}>{paying ? "Payment process ho rahi hai..." : "Checkout & Pay"}</Text>
        </Pressable>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: "800", color: "#202126" },
  subtitle: { marginTop: 8, color: "#5e6167", lineHeight: 22 },
  itemTitle: { fontSize: 22, fontWeight: "800", color: "#202126" },
  itemSubtitle: { marginTop: 6, color: "#5e6167" },
  itemRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 16 },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  qtyButton: {
    width: 36,
    height: 36,
    borderRadius: 999,
    backgroundColor: "#f8f1e8",
    alignItems: "center",
    justifyContent: "center",
  },
  qtyButtonText: { fontSize: 20, fontWeight: "800", color: "#202126" },
  qtyValue: { fontSize: 18, fontWeight: "700", color: "#202126" },
  removeText: { color: "#7a2e1d", fontWeight: "700" },
  emptyText: { color: "#5e6167", lineHeight: 22 },
  sectionTitle: { fontSize: 22, fontWeight: "800", color: "#202126" },
  input: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#e8dac9",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#fff",
  },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 14 },
  summaryLabel: { color: "#5e6167" },
  summaryValue: { color: "#202126", fontWeight: "700" },
  summaryTotalLabel: { color: "#202126", fontWeight: "800", fontSize: 18 },
  summaryTotalValue: { color: "#7a2e1d", fontWeight: "800", fontSize: 22 },
  primaryButton: {
    marginTop: 18,
    backgroundColor: "#7a2e1d",
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: { color: "#fff", fontWeight: "700" },
});
