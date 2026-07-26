const { z } = require("zod");

const addressSchema = z.object({
  label: z.string().trim().optional(),
  line1: z.string().trim().min(3),
  line2: z.string().trim().optional(),
  city: z.string().trim().min(2),
  state: z.string().trim().min(2),
  pincode: z.string().trim().min(4),
  landmark: z.string().trim().optional(),
});

const createStoreOrderSchema = z.object({
  body: z.object({
    items: z
      .array(
        z.object({
          productId: z.string().trim().min(10),
          quantity: z.number().int().min(1),
        })
      )
      .min(1),
    shippingAddress: addressSchema,
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

module.exports = { createStoreOrderSchema };
