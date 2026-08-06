import { z } from "zod";

export const createStudentPlanSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .max(50, "El nombre no puede tener más de 50 caracteres"),
  classesPerMonth: z.coerce
    .number()
    .int("Debe ser un número entero")
    .min(1, "Las clases por mes deben ser mayores a 0")
    .max(50, "Las clases por mes no pueden ser mayores a 50"),
  price: z.coerce.number().min(0.01, "El precio debe ser mayor a 0"),
});

export const updateStudentPlanSchema = z.object({
  name: z
    .string()
    .max(50, "El nombre no puede tener más de 50 caracteres")
    .optional(),
  classesPerMonth: z.coerce
    .number()
    .int("Debe ser un número entero")
    .min(1, "Las clases por mes deben ser mayores a 0")
    .max(50, "Las clases por mes no pueden ser mayores a 50")
    .optional(),
  price: z.coerce.number().min(0.01, "El precio debe ser mayor a 0").optional(),
});
