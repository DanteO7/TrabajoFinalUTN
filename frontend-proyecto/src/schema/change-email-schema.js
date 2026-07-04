import { z } from "zod";

export const changeEmailSchema = z.object({
  newEmail: z
    .string()
    .min(3, "Email es requerido")
    .max(100, "El email no debe tener mas de 100 caracteres")
    .refine((value) => value.includes("@"), "Debe ser un email válido"),
  verificationCode: z
    .string()
    .min(6, "El código debe tener al menos 6 caracteres")
    .max(6, "El código no debe tener mas de 6 caracteres"),
});
