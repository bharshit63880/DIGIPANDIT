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

const createBookingSchema = z.object({
  body: z.object({
    panditProfileId: z.string().trim().min(10),
    serviceId: z.string().trim().min(10),
    scheduleAt: z.string().datetime(),
    address: addressSchema.optional(),
    notes: z.string().trim().optional(),
    meetingMode: z.enum(["ONLINE", "OFFLINE"]).optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

const bookingStatusSchema = z.object({
  body: z.object({
    status: z.enum(["ACCEPTED", "REJECTED", "CANCELLED", "COMPLETED"]),
  }),
  query: z.object({}).optional(),
  params: z.object({
    bookingId: z.string().trim().min(10),
  }),
});

module.exports = { createBookingSchema, bookingStatusSchema };
