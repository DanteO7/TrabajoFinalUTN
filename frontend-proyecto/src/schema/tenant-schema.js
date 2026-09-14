import { z } from "zod";

export const createTenantSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es obligatorio")
    .max(50, "Máximo 50 caracteres"),

  tenantPlanId: z.coerce
    .number({
      required_error: "Seleccioná un plan",
    })
    .int()
    .positive("Seleccioná un plan"),
});

export const updateTenantSchema = z.object({
  alias: z
    .string()
    .trim()
    .max(50, "El alias no puede tener más de 50 caracteres")
    .optional()
    .or(z.literal("")),

  cbu: z
    .string()
    .trim()
    .regex(/^\d{22}$/, "El CBU debe tener exactamente 22 dígitos")
    .optional()
    .or(z.literal("")),

  address: z
    .string()
    .trim()
    .max(200, "La dirección no puede tener más de 200 caracteres")
    .optional()
    .or(z.literal("")),
});
