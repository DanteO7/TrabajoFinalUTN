import { z } from "zod";
import { validationMessage } from "../utils/validation-message";

export const changeEmailSchema = z.object({
  newEmail: z
    .string()
    .min(3, validationMessage("emailRequired"))
    .max(100, validationMessage("emailMax100"))
    .refine((value) => value.includes("@"), validationMessage("emailValid")),
  verificationCode: z
    .string()
    .min(6, validationMessage("codeMin6"))
    .max(6, validationMessage("codeMax6")),
});
