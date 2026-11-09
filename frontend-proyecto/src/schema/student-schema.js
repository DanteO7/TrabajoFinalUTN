import { z } from "zod";
import { validationMessage } from "../utils/validation-message";

export const createStudentSchema = z.object({
  email: z
    .string()
    .min(3, validationMessage("emailRequired"))
    .max(100, validationMessage("emailMax100"))
    .refine((value) => value.includes("@"), validationMessage("emailValid")),
});
