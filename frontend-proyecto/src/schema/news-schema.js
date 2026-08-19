import { z } from "zod";

export const createNewsSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio")
    .max(50, "El nombre no puede superar los 50 caracteres"),

  content: z
    .string()
    .trim()
    .min(1, "El contenido es obligatorio")
    .max(300, "La descripción no puede superar los 300 caracteres"),

  tenantId: z.string().optional(),
});
