import { z } from "zod";
import { validationMessage } from "../utils/validation-message";

export const createActivitySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, validationMessage("nameRequired"))
    .max(20, validationMessage("nameMax20")),

  description: z
    .string()
    .trim()
    .max(300, validationMessage("descriptionMax300"))
    .optional()
    .or(z.literal("")),
});

export const updateActivitySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, validationMessage("nameRequired"))
    .max(20, validationMessage("nameMax20")),
  description: z
    .string()
    .trim()
    .max(300, validationMessage("descriptionMax300"))
    .optional()
    .or(z.literal("")),
});
