import { z } from "zod";
import { validationMessage } from "../utils/validation-message";

export const updateUserSchema = z.object({
  name: z
    .string()
    .min(1, validationMessage("nameRequired"))
    .max(50, validationMessage("maxLength50")),
  surname: z
    .string()
    .min(1, validationMessage("surnameRequired"))
    .max(50, validationMessage("maxLength50")),
  phoneNumber: z
    .string()
    .trim()
    .refine(
      (val) =>
        val === "" ||
        (val.length >= 8 && val.length <= 20 && /^[0-9+\-\s()]+$/.test(val)),
      validationMessage("phoneInvalid"),
    )
    .optional(),
  age: z
    .union([z.string(), z.number()])
    .transform((val) => {
      if (val === "" || val === null || val === undefined) return undefined;
      return Number(val);
    })
    .refine(
      (val) => val === undefined || (val >= 1 && val <= 120),
      validationMessage("ageRange"),
    )
    .optional(),

  weight: z
    .union([z.string(), z.number()])
    .transform((val) => {
      if (val === "" || val === null || val === undefined) return undefined;
      return Number(val);
    })
    .refine(
      (val) => val === undefined || (val >= 1 && val <= 300),
      validationMessage("weightRange"),
    )
    .optional(),
  pathologies: z.string().optional(),
});
