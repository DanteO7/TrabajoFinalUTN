import { z } from "zod";
import { validationMessage } from "../utils/validation-message";

export const createTenantPlanSchema = z.object({
  name: z
    .string()
    .min(1, validationMessage("nameRequiredAlt"))
    .max(50, validationMessage("nameMax50")),
  price: z.coerce.number().min(0.01, validationMessage("priceMin")),
  maxStudents: z.coerce
    .number()
    .int(validationMessage("integerRequired"))
    .min(1, validationMessage("maxStudentsMin"))
    .max(1000, validationMessage("maxStudentsMax")),
  maxProfessors: z.coerce
    .number()
    .int(validationMessage("integerRequired"))
    .min(1, validationMessage("maxProfessorsMin"))
    .max(50, validationMessage("maxProfessorsMax")),
  includesExercisesAndRoutines: z.boolean(),
});

export const updateTenantPlanSchema = z.object({
  name: z
    .string()
    .max(50, validationMessage("nameMax50"))
    .optional(),
  price: z.coerce.number().min(0.01, validationMessage("priceMin")).optional(),
  maxStudents: z.coerce
    .number()
    .int(validationMessage("integerRequired"))
    .min(1, validationMessage("maxStudentsMin"))
    .max(1000, validationMessage("maxStudentsMax"))
    .optional(),
  maxProfessors: z.coerce
    .number()
    .int(validationMessage("integerRequired"))
    .min(1, validationMessage("maxProfessorsMin"))
    .max(50, validationMessage("maxProfessorsMax"))
    .optional(),
  includesExercisesAndRoutines: z.boolean().optional(),
});
