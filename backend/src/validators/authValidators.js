const { z } = require("zod");

const addressSchema = z.object({
  label: z.string().trim().optional(),
  line1: z.string().trim().min(3),
  line2: z.string().trim().optional(),
  city: z.string().trim().min(2),
  state: z.string().trim().min(2),
  pincode: z.string().trim().min(4),
  landmark: z.string().trim().optional(),
  isDefault: z.boolean().optional(),
});

const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2),
    email: z.string().email(),
    phone: z.string().trim().min(8).optional(),
    password: z.string().min(6),
    role: z.enum(["USER", "PANDIT"]).optional(),
    city: z.string().trim().optional(),
    state: z.string().trim().optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

const otpSchema = z.object({
  body: z.object({
    email: z.string().email(),
    otp: z.string().trim().length(6),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

const requestOtpSchema = z.object({
  body: z.object({
    email: z.string().email(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string().email(),
    otp: z.string().trim().length(6),
    newPassword: z.string().min(6),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).optional(),
    phone: z.string().trim().optional(),
    gender: z.string().trim().optional(),
    dateOfBirth: z.string().datetime().optional(),
    city: z.string().trim().optional(),
    state: z.string().trim().optional(),
    addresses: z.array(addressSchema).optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

module.exports = {
  registerSchema,
  loginSchema,
  otpSchema,
  requestOtpSchema,
  resetPasswordSchema,
  updateProfileSchema,
};
