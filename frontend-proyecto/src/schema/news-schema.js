import { z } from "zod";
import { validationMessage } from "../utils/validation-message";

export const createNewsSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, validationMessage("nameRequired"))
    .max(50, validationMessage("nameMax50")),

  content: z
    .string()
    .trim()
    .min(1, validationMessage("contentRequired"))
    .max(300, validationMessage("descriptionMax300")),

  tenantId: z.string().optional(),
});

export const updateNewSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, validationMessage("nameRequired"))
    .max(50, validationMessage("nameMax50")),

  content: z
    .string()
    .trim()
    .min(1, validationMessage("contentRequired"))
    .max(300, validationMessage("descriptionMax300")),
});
