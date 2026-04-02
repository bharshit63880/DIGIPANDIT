const { z } = require("zod");

const createPaymentSchema = z.object({
  body: z.object({
    entityType: z.enum(["BOOKING", "STORE_ORDER", "WALLET_TOPUP"]),
    entityId: z.string().trim().min(10),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

const verifyPaymentSchema = z.object({
  body: z.object({
    entityType: z.enum(["BOOKING", "STORE_ORDER", "WALLET_TOPUP"]),
    entityId: z.string().trim().min(10),
    razorpayPaymentId: z.string().trim().min(3),
    razorpayOrderId: z.string().trim().min(3),
    razorpaySignature: z.string().trim().optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

const failPaymentSchema = z.object({
  body: z.object({
    entityType: z.enum(["BOOKING", "STORE_ORDER", "WALLET_TOPUP"]),
    entityId: z.string().trim().min(10),
    razorpayOrderId: z.string().trim().min(3).optional(),
    reason: z.string().trim().min(3).max(300).optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

module.exports = { createPaymentSchema, verifyPaymentSchema, failPaymentSchema };
