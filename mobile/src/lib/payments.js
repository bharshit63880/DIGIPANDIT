import { Alert } from "react-native";
import { api } from "./api";

export const payEntity = async ({ entityType, entityId }) => {
  const orderResponse = await api.post("/payments/create-order", {
    entityType,
    entityId,
  });

  const order = orderResponse.data.data;

  if (order.mock || !order.keyId) {
    const verifyResponse = await api.post("/payments/verify", {
      entityType,
      entityId,
      razorpayPaymentId: `mobile_mock_payment_${Date.now()}`,
      razorpayOrderId: order.id,
    });

    return {
      mode: "mock",
      entity: verifyResponse.data.data,
    };
  }

  Alert.alert(
    "Live payment setup pending",
    "Mobile Expo app me abhi demo/mock payment fully enabled hai. Real Razorpay checkout ke liye native integration ka next step pending hai."
  );

  throw new Error("Live mobile Razorpay checkout abhi enabled nahi hai.");
};
