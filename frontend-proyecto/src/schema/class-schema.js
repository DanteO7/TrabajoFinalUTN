import { z } from "zod";

export const createClassSchema = z
  .object({
    activityId: z.string().min(1, "La actividad es obligatoria"),
    professorId: z.string().min(1, "El profesor es obligatorio"),
    date: z.string().min(1, "La fecha es obligatoria"),
    startTime: z.string().min(1, "La hora de inicio es obligatoria"),
    endTime: z.string().min(1, "La hora de fin es obligatoria"),
    maxCapacity: z.coerce
      .number({
        invalid_type_error: "La capacidad es obligatoria",
      })
      .int("Debe ser un número entero")
      .min(1, "La capacidad debe ser mayor a 0")
      .max(1000, "La capacidad es demasiado grande"),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "La hora de finalización debe ser mayor a la hora de inicio",
    path: ["endTime"],
  });
