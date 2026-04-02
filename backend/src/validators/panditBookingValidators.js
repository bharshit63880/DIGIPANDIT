const { z } = require("zod");

const addressSchema = z.object({
  label: z.string().trim().optional(),
  line1: z.string().trim().min(3, "Address line is required"),
  line2: z.string().trim().optional(),
  city: z.string().trim().min(2, "City is required"),
  state: z.string().trim().min(2, "State is required"),
  pincode: z.string().trim().min(4, "Pincode is required"),
  landmark: z.string().trim().optional(),
});

const bookPanditSchema = z.object({
  body: z
    .object({
      panditProfileId: z.string().trim().min(10),
      serviceId: z.string().trim().min(10),
      scheduleAt: z.string().datetime(),
      address: addressSchema.optional(),
      notes: z.string().trim().optional(),
      meetingMode: z.enum(["ONLINE", "OFFLINE"]).default("OFFLINE"),
      travelCharge: z.coerce.number().min(0).optional(),
      samagriCost: z.coerce.number().min(0).optional(),
      extraDakshina: z.coerce.number().min(0).optional(),
      videoDakshinaFee: z.coerce.number().min(0).optional(),
    })
    .superRefine((value, ctx) => {
      if (value.meetingMode === "OFFLINE" && !value.address) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Address is required for offline pandit booking",
          path: ["address"],
        });
      }
    }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

const listPanditServicesSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    city: z.string().trim().optional(),
    serviceType: z.enum(["PUJA", "HAWAN", "KATHA"]).optional(),
  }),
  params: z.object({}).optional(),
});

module.exports = {
  bookPanditSchema,
  listPanditServicesSchema,
};
