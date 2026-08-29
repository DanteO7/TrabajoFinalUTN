import { z } from "zod";

export const routineExerciseSchema = z.object({
  exerciseId: z.string().min(1, "El ejercicio es obligatorio"),

  sets: z.coerce
    .number({
      invalid_type_error: "Las series son obligatorias",
    })
    .int("Las series deben ser un número entero")
    .min(1, "Debe haber al menos 1 serie"),

  repetitions: z.coerce
    .number({
      invalid_type_error: "Las repeticiones son obligatorias",
    })
    .int("Las repeticiones deben ser un número entero")
    .min(1, "Debe haber al menos 1 repetición"),

  weight: z.coerce
    .number({
      invalid_type_error: "El peso debe ser un número",
    })
    .min(0, "El peso no puede ser negativo")
    .optional()
    .or(z.literal("")),

  order: z.coerce
    .number({
      invalid_type_error: "El orden es obligatorio",
    })
    .int("El orden debe ser un número entero")
    .min(1, "El orden debe ser mayor a 0"),
});

export const createRoutineSchema = z
  .object({
    name: z
      .string()
      .min(1, "El nombre de la rutina es obligatorio")
      .max(50, "El nombre de la rutina no puede tener más de 50 caracteres"),

    description: z
      .string()
      .max(
        300,
        "La descripción de la rutina no puede tener más de 300 caracteres",
      )
      .optional()
      .or(z.literal("")),

    exercises: z
      .array(routineExerciseSchema)
      .min(1, "La rutina debe tener al menos un ejercicio"),
  })
  .superRefine((data, ctx) => {
    const orders = data.exercises.map((exercise) => exercise.order);

    if (new Set(orders).size !== orders.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "No puede haber dos ejercicios con el mismo orden",
        path: ["exercises"],
      });
    }
  });

export const updateRoutineSchema = z
  .object({
    name: z
      .string()
      .min(1, "El nombre de la rutina es obligatorio")
      .max(50, "El nombre de la rutina no puede tener más de 50 caracteres")
      .optional()
      .or(z.literal("")),

    description: z
      .string()
      .max(
        300,
        "La descripción de la rutina no puede tener más de 300 caracteres",
      )
      .optional()
      .or(z.literal("")),

    exercises: z.array(routineExerciseSchema).optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.exercises) return;

    const orders = data.exercises.map((exercise) => exercise.order);

    if (new Set(orders).size !== orders.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "No puede haber dos ejercicios con el mismo orden",
        path: ["exercises"],
      });
    }
  });
