import { z } from "zod";
import { validationMessage } from "../utils/validation-message";

export const createSpecialitySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, validationMessage("nameRequired"))
    .max(50, validationMessage("nameMax50")),

  description: z
    .string()
    .trim()
    .max(300, validationMessage("descriptionMax300"))
    .optional()
    .or(z.literal("")),
});

export const updateSpecialitySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, validationMessage("nameRequired"))
    .max(50, validationMessage("nameMax50")),

  description: z
    .string()
    .trim()
    .max(300, validationMessage("descriptionMax300"))
    .optional()
    .or(z.literal("")),
});
