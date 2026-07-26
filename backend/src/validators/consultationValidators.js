const { z } = require("zod");

const listAstrologersSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    mode: z.enum(["CHAT", "AUDIO", "VIDEO"]).optional(),
    onlineOnly: z.enum(["true", "false"]).optional(),
    specialization: z.string().trim().optional(),
    language: z.string().trim().optional(),
  }),
  params: z.object({}).optional(),
});

const startSessionSchema = z.object({
  body: z.object({
    astrologerProfileId: z.string().trim().min(10),
    serviceId: z.string().trim().min(10),
    sessionType: z.enum(["CHAT", "AUDIO", "VIDEO"]),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

const endSessionSchema = z.object({
  body: z.object({
    sessionId: z.string().trim().min(10),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

module.exports = {
  listAstrologersSchema,
  startSessionSchema,
  endSessionSchema,
};
