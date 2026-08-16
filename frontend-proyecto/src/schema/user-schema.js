import { z } from "zod";

export const updateUserSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es obligatorio")
    .max(50, "Máximo 50 caracteres"),
  surname: z
    .string()
    .min(1, "El apellido es obligatorio")
    .max(50, "Máximo 50 caracteres"),
  phoneNumber: z
    .string()
    .trim()
    .refine(
      (val) =>
        val === "" ||
        (val.length >= 8 && val.length <= 20 && /^[0-9+\-\s()]+$/.test(val)),
      "Formato de teléfono inválido",
    )
    .optional(),
});
