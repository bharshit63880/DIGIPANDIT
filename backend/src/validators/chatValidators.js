const { z } = require("zod");

const createRoomSchema = z.object({
  body: z.object({
    participantId: z.string().trim().min(10),
    bookingId: z.string().trim().min(10).optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

const sendMessageSchema = z.object({
  body: z.object({
    content: z.string().trim().min(1).max(1000),
  }),
  query: z.object({}).optional(),
  params: z.object({
    roomId: z.string().trim().min(10),
  }),
});

module.exports = { createRoomSchema, sendMessageSchema };
