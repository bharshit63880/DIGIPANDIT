const { z } = require("zod");

const createPaymentSchema = z.object({
  body: z.object({
    entityType: z.enum(["BOOKING", "STORE_ORDER"]),
    entityId: z.string().trim().min(10),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

const verifyPaymentSchema = z.object({
  body: z.object({
    entityType: z.enum(["BOOKING", "STORE_ORDER"]),
    entityId: z.string().trim().min(10),
    razorpayPaymentId: z.string().trim().min(3),
    razorpayOrderId: z.string().trim().min(3),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

module.exports = { createPaymentSchema, verifyPaymentSchema };
