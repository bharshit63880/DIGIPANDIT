import React, { useEffect, useState } from "react";
import { Alert, Linking, Pressable, StyleSheet, Text } from "react-native";
import { Screen } from "../components/Screen";
import { Card } from "../components/Card";
import { api } from "../lib/api";
import { payEntity } from "../lib/payments";

export function BookingsScreen() {
  const [bookings, setBookings] = useState([]);
  const [orders, setOrders] = useState([]);

  const loadData = async () => {
    const [bookingRes, orderRes] = await Promise.all([api.get("/bookings/me"), api.get("/store/orders/me")]);
    setBookings(bookingRes.data.data);
    setOrders(orderRes.data.data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePay = async (entityType, entityId) => {
    try {
      await payEntity({ entityType, entityId });
      Alert.alert("Payment done", "Payment successfully complete ho gayi.");
      await loadData();
    } catch (error) {
      Alert.alert("Payment failed", error.message);
    }
  };

  return (
    <Screen>
      <Card>
        <Text style={styles.title}>Bookings & orders</Text>
        <Text style={styles.subtitle}>See your upcoming rituals and puja samagri purchases together.</Text>
      </Card>

      {bookings.map((booking) => (
        <Card key={booking._id}>
          <Text style={styles.cardTitle}>{booking.serviceName}</Text>
          <Text style={styles.subtitle}>{booking.status} | {new Date(booking.scheduleAt).toLocaleString()}</Text>
          <Text style={styles.metaText}>Payment: {booking.payment?.status || "NA"}</Text>
          {booking.meetingLink && booking.payment?.status === "PAID" ? (
            <Pressable style={styles.secondaryButton} onPress={() => Linking.openURL(booking.meetingLink)}>
              <Text style={styles.secondaryButtonText}>Open video call</Text>
            </Pressable>
          ) : null}
          {booking.payment?.status === "CREATED" ? (
            <Pressable style={styles.primaryButton} onPress={() => handlePay("BOOKING", booking._id)}>
              <Text style={styles.primaryButtonText}>Pay now</Text>
            </Pressable>
          ) : null}
        </Card>
      ))}

      {orders.map((order) => (
        <Card key={order._id}>
          <Text style={styles.cardTitle}>Store order</Text>
          <Text style={styles.subtitle}>{order.orderStatus} | Rs. {order.pricing?.total}</Text>
          <Text style={styles.metaText}>Payment: {order.payment?.status || "NA"}</Text>
          {order.payment?.status === "CREATED" ? (
            <Pressable style={styles.primaryButton} onPress={() => handlePay("STORE_ORDER", order._id)}>
              <Text style={styles.primaryButtonText}>Pay now</Text>
            </Pressable>
          ) : null}
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 26, fontWeight: "800", color: "#202126" },
  subtitle: { marginTop: 6, color: "#5e6167", lineHeight: 20 },
  cardTitle: { fontSize: 20, fontWeight: "800", color: "#202126" },
  metaText: { marginTop: 10, color: "#7a2e1d", fontWeight: "700" },
  primaryButton: {
    marginTop: 14,
    alignSelf: "flex-start",
    backgroundColor: "#7a2e1d",
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  primaryButtonText: { color: "#fff", fontWeight: "700" },
  secondaryButton: {
    marginTop: 14,
    alignSelf: "flex-start",
    backgroundColor: "#202126",
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  secondaryButtonText: { color: "#fff", fontWeight: "700" },
});
