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
