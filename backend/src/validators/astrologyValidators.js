const { z } = require("zod");

const coordinateSchema = z.coerce.number();

const createKundaliSchema = z.object({
  body: z.object({
    fullName: z.string().trim().min(2, "Full name must be at least 2 characters").max(120, "Full name is too long"),
    birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "birthDate must use YYYY-MM-DD format"),
    birthTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "birthTime must use HH:mm or HH:mm:ss format"),
    latitude: coordinateSchema
      .min(-90, "Latitude must be between -90 and 90")
      .max(90, "Latitude must be between -90 and 90"),
    longitude: coordinateSchema
      .min(-180, "Longitude must be between -180 and 180")
      .max(180, "Longitude must be between -180 and 180"),
    placeName: z.string().trim().max(120).optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

const personSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  birthTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/),
  placeName: z.string().trim().min(2).max(120),
});

const matchingSchema = z.object({
  body: z.object({ bride: personSchema, groom: personSchema }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

const numerologySchema = z.object({
  body: personSchema.pick({ fullName: true, birthDate: true }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

module.exports = {
  createKundaliSchema,
  matchingSchema,
  numerologySchema,
};
