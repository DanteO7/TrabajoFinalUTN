import * as z from "zod";

export const signInSchema = z.object({
  email: z
    .string()
    .min(3, "Email es requerido")
    .max(100, "El email no debe tener mas de 100 caracteres")
    .refine((value) => value.includes("@"), "Debe ser un email válido"),
  password: z.string(),
});

export const signUpSchema = z
  .object({
    name: z
      .string()
      .min(2, "El nombre debe tener al menos 2 caracteres")
      .max(50, "El nombre no debe tener mas de 50 caracteres"),
    surname: z
      .string()
      .min(2, "El apellido debe tener al menos 2 caracteres")
      .max(50, "El apellido no debe tener mas de 50 caracteres"),
    email: z
      .string()
      .min(3, "Email es requerido")
      .max(100, "El email no debe tener mas de 100 caracteres")
      .refine((value) => value.includes("@"), "Debe ser un email válido"),
    password: z
      .string()
      .regex(
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/,
        "La contraseña debe tener al menos 8 caracteres, incluir una mayusula, una minuscula y un numero",
      ),
    confirmPassword: z
      .string()
      .regex(
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/,
        "La contraseña debe tener al menos 8 caracteres, incluir una mayusula, una minuscula y un numero",
      ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });
