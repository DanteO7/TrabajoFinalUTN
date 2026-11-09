import { z } from "zod";
import { validationError, validationMessage } from "../utils/validation-message";

export const createTenantSchema = z.object({
  name: z
    .string()
    .min(1, validationMessage("nameRequired"))
    .max(50, validationMessage("maxLength50")),

  tenantPlanId: z.coerce
    .number({
      error: validationError("planRequired"),
    })
    .int()
    .positive(validationMessage("planRequired")),
});

export const updateTenantSchema = z.object({
  name: z
    .string()
    .min(1, validationMessage("nameRequired"))
    .max(50, validationMessage("maxLength50")),

  alias: z
    .string()
    .trim()
    .max(50, validationMessage("aliasMax50"))
    .optional()
    .or(z.literal("")),

  cbu: z
    .string()
    .trim()
    .regex(/^\d{22}$/, validationMessage("cbuLength"))
    .optional()
    .or(z.literal("")),

  address: z
    .string()
    .trim()
    .max(200, validationMessage("addressMax200"))
    .optional()
    .or(z.literal("")),
});
