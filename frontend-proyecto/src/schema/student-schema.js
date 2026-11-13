import { z } from "zod";
import { validationMessage } from "../utils/validation-message";

export const createStudentSchema = z.object({
  email: z
    .string()
    .min(3, validationMessage("emailRequired"))
    .max(100, validationMessage("emailMax100"))
    .refine((value) => value.includes("@"), validationMessage("emailValid")),
});

export const createStudentWithoutUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, validationMessage("nameMin2"))
    .max(50, validationMessage("nameMax50")),
  surname: z
    .string()
    .trim()
    .min(2, validationMessage("surnameMin2"))
    .max(50, validationMessage("surnameMax50")),
  studentPlanId: z.coerce.number({ invalid_type_error: validationMessage("planRequired") }).min(1, validationMessage("planRequired")),
});
