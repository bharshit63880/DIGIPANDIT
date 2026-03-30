const { z } = require("zod");

const serviceSchema = z.object({
  name: z.string().trim().min(2),
  category: z.enum(["PUJA", "ASTROLOGY_CHAT", "ASTROLOGY_CALL"]),
  description: z.string().trim().optional(),
  durationInMinutes: z.number().min(15).optional(),
  price: z.number().min(0),
  isActive: z.boolean().optional(),
});

const availabilitySchema = z.object({
  day: z.enum(["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]),
  startTime: z.string().trim().min(4),
  endTime: z.string().trim().min(4),
  isAvailable: z.boolean().optional(),
});

const upsertPanditProfileSchema = z.object({
  body: z.object({
    bio: z.string().trim().optional(),
    experienceInYears: z.number().min(0).optional(),
    specialization: z.array(z.string().trim()).optional(),
    languages: z.array(z.string().trim()).optional(),
    serviceCities: z.array(z.string().trim()).optional(),
    isOnline: z.boolean().optional(),
    services: z.array(serviceSchema).optional(),
    availability: z.array(availabilitySchema).optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

const withdrawalSchema = z.object({
  body: z.object({
    amount: z.number().min(1),
    accountDetails: z.object({
      accountName: z.string().trim().optional(),
      accountNumber: z.string().trim().optional(),
      ifscCode: z.string().trim().optional(),
      upiId: z.string().trim().optional(),
    }),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

module.exports = { upsertPanditProfileSchema, withdrawalSchema };
