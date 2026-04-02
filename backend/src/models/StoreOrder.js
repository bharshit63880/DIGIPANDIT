const mongoose = require("mongoose");

const storeOrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
        quantity: { type: Number, required: true, min: 1 },
        image: String,
      },
    ],
    shippingAddress: {
      label: String,
      line1: String,
      line2: String,
      city: String,
      state: String,
      pincode: String,
      landmark: String,
    },
    pricing: {
      subtotal: { type: Number, required: true, min: 0 },
      shippingFee: { type: Number, default: 0, min: 0 },
      total: { type: Number, required: true, min: 0 },
    },
    orderStatus: {
      type: String,
      enum: ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"],
      default: "PENDING",
    },
    payment: {
      status: {
        type: String,
        enum: ["CREATED", "PAID", "FAILED", "REFUNDED"],
        default: "CREATED",
      },
      gatewayOrderId: String,
      gatewayPaymentId: String,
      failureReason: String,
      amount: { type: Number, required: true, min: 0 },
      paidAt: Date,
    },
  },
  { timestamps: true }
);

storeOrderSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("StoreOrder", storeOrderSchema);
