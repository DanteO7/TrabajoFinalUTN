import { z } from "zod";

export const createExerciseSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre del ejercicio es obligatorio")
    .max(50, "El nombre del ejercicio no puede tener más de 50 caracteres"),

  description: z
    .string()
    .max(
      300,
      "La descripción del ejercicio no puede tener más de 300 caracteres",
    )
    .optional()
    .or(z.literal("")),
});

export const updateExerciseSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre del ejercicio es obligatorio")
    .max(50, "El nombre del ejercicio no puede tener más de 50 caracteres"),

  description: z
    .string()
    .max(
      300,
      "La descripción del ejercicio no puede tener más de 300 caracteres",
    )
    .optional()
    .or(z.literal("")),
});
