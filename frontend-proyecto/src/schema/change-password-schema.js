import { z } from "zod";

export const changePasswordSchema = z
  .object({
    newPassword: z
      .string()
      .regex(
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/,
        "La contraseña debe tener al menos 8 caracteres, incluir una mayusula, una minuscula y un numero",
      ),
    confirmNewPassword: z
      .string()
      .regex(
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/,
        "La contraseña debe tener al menos 8 caracteres, incluir una mayusula, una minuscula y un numero",
      ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmNewPassword"],
  });
