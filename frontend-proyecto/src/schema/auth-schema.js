import * as z from "zod";
import { validationError, validationMessage } from "../utils/validation-message";

export const signInSchema = z.object({
  email: z
    .string()
    .min(3, validationMessage("emailRequired"))
    .max(100, validationMessage("emailMax100"))
    .refine((value) => value.includes("@"), validationMessage("emailValid")),
  password: z.string(),
});

export const signUpSchema = z
  .object({
    name: z
      .string()
      .min(2, validationMessage("nameMin2"))
      .max(50, validationMessage("nameMax50")),
    surname: z
      .string()
      .min(2, validationMessage("surnameMin2"))
      .max(50, validationMessage("surnameMax50")),
    email: z
      .string()
      .min(3, validationMessage("emailRequired"))
      .max(100, validationMessage("emailMax100"))
      .refine((value) => value.includes("@"), validationMessage("emailValid")),
    password: z
      .string()
      .regex(
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/,
        validationMessage("passwordPolicy"),
      ),
    confirmPassword: z
      .string()
      .regex(
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/,
        validationMessage("passwordPolicy"),
      ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: validationError("passwordMismatch"),
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, validationMessage("emailMandatory"))
    .min(4, validationMessage("emailRequired"))
    .max(100, validationMessage("emailMax100"))
    .email(validationMessage("emailValid"))
    .refine((value) => value.includes("@"), validationMessage("emailValid")),
});
