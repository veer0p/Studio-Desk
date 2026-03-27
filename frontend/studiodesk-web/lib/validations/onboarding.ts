import { z } from "zod";

export const step1Schema = z.object({
  name: z.string().min(2, "Studio Name must be at least 2 characters").max(80, "Studio Name must be at most 80 characters"),
  type: z.enum(["Photography Only", "Videography Only", "Photo + Video", "Full Production House"], { message: "Studio Type is required" }),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  yearsInBusiness: z.coerce.number().optional().or(z.nan().transform(() => undefined)),
  tagline: z.string().max(120, "Tagline must be at most 120 characters").optional().or(z.literal("")),
});

export const step2Schema = z.object({
  fullName: z.string().min(2, "Full Name must be at least 2 characters"),
  phone: z.string().regex(/^\d{10}$/, "Phone must be exactly 10 digits"),
  whatsapp: z.string().regex(/^\d{10}$/, "WhatsApp must be exactly 10 digits").optional().or(z.literal("")),
  language: z.enum(["Hindi", "English", "Gujarati", "Marathi", "Tamil", "Telugu", "Other"]).optional(),
  designation: z.string().optional().or(z.literal("")),
});

export const teamMemberSchema = z.object({
  name: z.string().optional().or(z.literal("")),
  role: z.enum(["Photographer", "Videographer", "Editor", "Drone Operator", "Assistant", "Admin"]).optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
}).superRefine((data, ctx) => {
  if (data.name && data.name.trim() !== "" && !data.role) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Role is required if Name is filled", path: ["role"] });
  }
});

export const step3Schema = z.object({
  members: z.array(teamMemberSchema).max(10, "Maximum 10 members allowed in this step")
});

export const packageSchema = z.object({
  name: z.string().min(1, "Package Name is required"),
  eventType: z.enum(["Wedding", "Engagement", "Corporate", "Birthday", "Product Shoot", "Other"], { message: "Event Type is required" }),
  duration: z.coerce.number().optional().or(z.nan().transform(() => undefined)),
  price: z.coerce.number().min(0, "Price must be zero or positive").or(z.nan().transform(() => undefined)),
  inclusions: z.string().max(200, "Inclusions must be at most 200 characters").optional().or(z.literal(""))
});


export const step4Schema = z.object({
  packages: z.array(packageSchema)
});

export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;
export type Step3Data = z.infer<typeof step3Schema>;
export type Step4Data = z.infer<typeof step4Schema>;
