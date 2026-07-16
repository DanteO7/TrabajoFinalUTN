import { z } from "zod";

export const createStudentSchema = z.object({
  email: z
    .string()
    .min(3, "Email es requerido")
    .max(100, "El email no debe tener mas de 100 caracteres")
    .refine((value) => value.includes("@"), "Debe ser un email válido"),
});
