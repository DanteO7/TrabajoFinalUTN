import * as z from "zod";

export const signInSchema = z.object({
  email: z
    .string()
    .min(1, "Email es requerido")
    .refine((value) => value.includes("@"), "Debe ser un email válido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});
