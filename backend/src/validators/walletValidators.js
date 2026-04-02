const { z } = require("zod");

const addMoneySchema = z.object({
  body: z.object({
    amount: z.coerce.number().positive("Amount must be greater than 0").max(50000, "Amount is too large"),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

module.exports = {
  addMoneySchema,
};
