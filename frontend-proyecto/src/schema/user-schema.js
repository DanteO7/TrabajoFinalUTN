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
    .min(8, "El teléfono es demasiado corto")
    .max(20, "El teléfono es demasiado largo")
    .regex(/^[0-9+\-\s()]+$/, "Formato de teléfono inválido")
    .optional(),
});
