import { z } from "zod";
import { validationMessage } from "../utils/validation-message";

export const createExerciseSchema = z.object({
  name: z
    .string()
    .min(1, validationMessage("exerciseNameRequired"))
    .max(50, validationMessage("exerciseNameMax50")),

  description: z
    .string()
    .max(
      300,
      validationMessage("exerciseDescriptionMax300"),
    )
    .optional()
    .or(z.literal("")),
});

export const updateExerciseSchema = z.object({
  name: z
    .string()
    .min(1, validationMessage("exerciseNameRequired"))
    .max(50, validationMessage("exerciseNameMax50")),

  description: z
    .string()
    .max(
      300,
      validationMessage("exerciseDescriptionMax300"),
    )
    .optional()
    .or(z.literal("")),
});
