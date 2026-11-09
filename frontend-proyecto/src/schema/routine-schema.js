import { z } from "zod";
import { validationError, validationMessage } from "../utils/validation-message";

export const routineExerciseSchema = z.object({
  exerciseId: z.string().min(1, validationMessage("exerciseRequired")),

  sets: z.coerce
    .number({
      error: validationError("setsRequired"),
    })
    .int(validationMessage("setsInteger"))
    .min(1, validationMessage("setsMin")),

  repetitions: z.coerce
    .number({
      error: validationError("repsRequired"),
    })
    .int(validationMessage("repsInteger"))
    .min(1, validationMessage("repsMin")),

  weight: z.coerce
    .number({
      error: validationError("weightNumber"),
    })
    .min(0, validationMessage("weightNonnegative"))
    .optional()
    .or(z.literal("")),

  order: z.coerce
    .number({
      error: validationError("orderRequired"),
    })
    .int(validationMessage("orderInteger"))
    .min(1, validationMessage("orderMin")),
});

export const createRoutineSchema = z
  .object({
    name: z
      .string()
      .min(1, validationMessage("routineNameRequired"))
      .max(50, validationMessage("routineNameMax50")),

    description: z
      .string()
      .max(
        300,
        validationMessage("routineDescriptionMax300"),
      )
      .optional()
      .or(z.literal("")),

    exercises: z
      .array(routineExerciseSchema)
      .min(1, validationMessage("routineExerciseRequired")),
  })
  .superRefine((data, ctx) => {
    const orders = data.exercises.map((exercise) => exercise.order);

    if (new Set(orders).size !== orders.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: validationError("duplicateExerciseOrder")(),
        path: ["exercises"],
      });
    }
  });

export const updateRoutineSchema = z
  .object({
    name: z
      .string()
      .min(1, validationMessage("routineNameRequired"))
      .max(50, validationMessage("routineNameMax50"))
      .optional()
      .or(z.literal("")),

    description: z
      .string()
      .max(
        300,
        validationMessage("routineDescriptionMax300"),
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
        message: validationError("duplicateExerciseOrder")(),
        path: ["exercises"],
      });
    }
  });
