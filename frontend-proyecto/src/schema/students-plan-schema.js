import { z } from "zod";
import { validationMessage } from "../utils/validation-message";

export const createStudentPlanSchema = z.object({
  name: z
    .string()
    .min(1, validationMessage("nameRequiredAlt"))
    .max(50, validationMessage("nameMax50")),
  classesPerMonth: z.coerce
    .number()
    .int(validationMessage("integerRequired"))
    .min(1, validationMessage("classesPerMonthMin"))
    .max(50, validationMessage("classesPerMonthMax")),
  price: z.coerce.number().min(0.01, validationMessage("priceMin")),
});

export const updateStudentPlanSchema = z.object({
  name: z
    .string()
    .max(50, validationMessage("nameMax50"))
    .optional(),
  classesPerMonth: z.coerce
    .number()
    .int(validationMessage("integerRequired"))
    .min(1, validationMessage("classesPerMonthMin"))
    .max(50, validationMessage("classesPerMonthMax"))
    .optional(),
  price: z.coerce.number().min(0.01, validationMessage("priceMin")).optional(),
});
