const { z } = require("zod");

const addMoneySchema = z.object({
  body: z.object({
    amount: z.coerce.number().min(100, "Minimum wallet topup is ₹100").max(50000, "Amount is too large"),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

module.exports = {
  addMoneySchema,
};
