import { api } from "./api";

const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export const payEntity = async ({ entityType, entityId, title, customer }) => {
  const orderResponse = await api.post("/payments/create-order", {
    entityType,
    entityId,
  });

  const order = orderResponse.data.data;

  if (order.mock || !order.keyId) {
    const verifyResponse = await api.post("/payments/verify", {
      entityType,
      entityId,
      razorpayPaymentId: `mock_payment_${Date.now()}`,
      razorpayOrderId: order.id,
    });

    return {
      mode: "mock",
      entity: verifyResponse.data.data,
    };
  }

  const isLoaded = await loadRazorpay();
  if (!isLoaded) {
    throw new Error("Razorpay checkout failed to load");
  }

  return new Promise((resolve, reject) => {
    const razorpay = new window.Razorpay({
      key: order.keyId,
      amount: order.amount,
      currency: order.currency || "INR",
      name: "DigiPandit",
      description: title || "DigiPandit Payment",
      order_id: order.id,
      prefill: {
        name: customer?.name || "",
        email: customer?.email || "",
        contact: customer?.phone || "",
      },
      theme: {
        color: "#8c351d",
      },
      handler: async (response) => {
        try {
          const verifyResponse = await api.post("/payments/verify", {
            entityType,
            entityId,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
          });

          resolve({
            mode: "razorpay",
            entity: verifyResponse.data.data,
          });
        } catch (error) {
          reject(error);
        }
      },
      modal: {
        ondismiss: () => reject(new Error("Payment cancelled")),
      },
    });

    razorpay.open();
  });
};
