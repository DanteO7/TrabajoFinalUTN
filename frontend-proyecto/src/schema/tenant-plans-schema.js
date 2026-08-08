import { z } from "zod";

export const createTenantPlanSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .max(50, "El nombre no puede tener más de 50 caracteres"),
  price: z.coerce.number().min(0.01, "El precio debe ser mayor a 0"),
  maxStudents: z.coerce
    .number()
    .int("Debe ser un número entero")
    .min(1, "Los alumnos máximos deben ser mayores a 0")
    .max(1000, "Los alumnos máximos no pueden ser mayores a 1000"),
  maxProfessors: z.coerce
    .number()
    .int("Debe ser un número entero")
    .min(1, "Los profesores máximos deben ser mayores a 0")
    .max(50, "Los profesores máximos no pueden ser mayores a 50"),
});

export const updateTenantPlanSchema = z.object({
  name: z
    .string()
    .max(50, "El nombre no puede tener más de 50 caracteres")
    .optional(),
  price: z.coerce.number().min(0.01, "El precio debe ser mayor a 0").optional(),
  maxStudents: z.coerce
    .number()
    .int("Debe ser un número entero")
    .min(1, "Los alumnos máximos deben ser mayores a 0")
    .max(1000, "Los alumnos máximos no pueden ser mayores a 1000")
    .optional(),
  maxProfessors: z.coerce
    .number()
    .int("Debe ser un número entero")
    .min(1, "Los profesores máximos deben ser mayores a 0")
    .max(50, "Los profesores máximos no pueden ser mayores a 50")
    .optional(),
});
