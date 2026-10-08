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

export const createClassTemplateSchema = z
  .object({
    activityId: z.string().min(1, "La actividad es obligatoria"),

    professorId: z.string().min(1, "El profesor es obligatorio"),

    dayOfWeek: z.coerce
      .number()
      .min(0, "El día es obligatorio")
      .max(6, "El día no es válido"),

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

export const updateClassSchema = z
  .object({
    activityId: z
      .string()
      .min(1, "La actividad es obligatoria")
      .optional()
      .or(z.literal("")),
    professorId: z
      .string()
      .min(1, "El profesor es obligatorio")
      .optional()
      .or(z.literal("")),
    date: z
      .string()
      .min(1, "La fecha es obligatoria")
      .optional()
      .or(z.literal("")),
    startTime: z
      .string()
      .min(1, "La hora de inicio es obligatoria")
      .optional()
      .or(z.literal("")),
    endTime: z
      .string()
      .min(1, "La hora de fin es obligatoria")
      .optional()
      .or(z.literal("")),
    maxCapacity: z.coerce
      .number({
        invalid_type_error: "La capacidad es obligatoria",
      })
      .int("Debe ser un número entero")
      .min(1, "La capacidad debe ser mayor a 0")
      .max(1000, "La capacidad es demasiado grande")
      .optional(),
  })
  .refine(
    (data) => {
      if (data.startTime && data.endTime) {
        return data.endTime > data.startTime;
      }
      return true;
    },
    {
      message: "La hora de finalización debe ser mayor a la hora de inicio",
      path: ["endTime"],
    },
  );

export const updateClassTemplateSchema = z
  .object({
    activityId: z
      .string()
      .min(1, "La actividad es obligatoria")
      .optional()
      .or(z.literal("")),

    professorId: z
      .string()
      .min(1, "El profesor es obligatorio")
      .optional()
      .or(z.literal("")),

    dayOfWeek: z
      .string()
      .min(1, "El día es obligatorio")
      .optional()
      .or(z.literal("")),

    startTime: z
      .string()
      .min(1, "La hora de inicio es obligatoria")
      .optional()
      .or(z.literal("")),

    endTime: z
      .string()
      .min(1, "La hora de fin es obligatoria")
      .optional()
      .or(z.literal("")),

    maxCapacity: z.coerce
      .number({
        invalid_type_error: "La capacidad es obligatoria",
      })
      .int("Debe ser un número entero")
      .min(1, "La capacidad debe ser mayor a 0")
      .max(1000, "La capacidad es demasiado grande")
      .optional(),
  })
  .refine(
    (data) => {
      if (data.startTime && data.endTime) {
        return data.endTime > data.startTime;
      }

      return true;
    },
    {
      message: "La hora de finalización debe ser mayor a la hora de inicio",
      path: ["endTime"],
    },
  );
