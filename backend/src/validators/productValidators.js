const { z } = require("zod");

const upsertProductSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2),
    slug: z.string().trim().min(2),
    category: z.enum(["PUJA_KIT", "IDOL", "INCENSE", "BOOK"]),
    description: z.string().trim().optional(),
    price: z.number().min(0),
    compareAtPrice: z.number().min(0).optional(),
    stock: z.number().int().min(0),
    tags: z.array(z.string().trim()).optional(),
    isActive: z.boolean().optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

module.exports = { upsertProductSchema };
