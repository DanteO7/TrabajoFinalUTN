import { z } from "zod";
import { validationError, validationMessage } from "../utils/validation-message";

export const changePasswordSchema = z
  .object({
    newPassword: z
      .string()
      .regex(
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/,
        validationMessage("passwordPolicy"),
      ),
    confirmNewPassword: z
      .string()
      .regex(
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/,
        validationMessage("passwordPolicy"),
      ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: validationError("passwordMismatch"),
    path: ["confirmNewPassword"],
  });
