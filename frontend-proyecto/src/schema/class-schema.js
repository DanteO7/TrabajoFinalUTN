import { z } from "zod";
import { validationError, validationMessage } from "../utils/validation-message";

export const createClassSchema = z
  .object({
    activityId: z.string().min(1, validationMessage("activityRequired")),
    professorId: z.string().min(1, validationMessage("professorRequired")),
    date: z.string().min(1, validationMessage("dateRequired")),
    startTime: z.string().min(1, validationMessage("startTimeRequired")),
    endTime: z.string().min(1, validationMessage("endTimeRequired")),
    maxCapacity: z.coerce
      .number({
        error: validationError("capacityRequired"),
      })
      .int(validationMessage("integerRequired"))
      .min(1, validationMessage("capacityMin"))
      .max(1000, validationMessage("capacityMax")),
  })
  .refine((data) => data.endTime > data.startTime, {
    error: validationError("endAfterStart"),
    path: ["endTime"],
  });

export const createClassTemplateSchema = z
  .object({
    activityId: z.string().min(1, validationMessage("activityRequired")),

    professorId: z.string().min(1, validationMessage("professorRequired")),

    dayOfWeek: z.coerce
      .number()
      .min(0, validationMessage("dayRequired"))
      .max(6, validationMessage("dayInvalid")),

    startTime: z.string().min(1, validationMessage("startTimeRequired")),

    endTime: z.string().min(1, validationMessage("endTimeRequired")),

    maxCapacity: z.coerce
      .number({
        error: validationError("capacityRequired"),
      })
      .int(validationMessage("integerRequired"))
      .min(1, validationMessage("capacityMin"))
      .max(1000, validationMessage("capacityMax")),
  })
  .refine((data) => data.endTime > data.startTime, {
    error: validationError("endAfterStart"),
    path: ["endTime"],
  });

export const updateClassSchema = z
  .object({
    activityId: z
      .string()
      .min(1, validationMessage("activityRequired"))
      .optional()
      .or(z.literal("")),
    professorId: z
      .string()
      .min(1, validationMessage("professorRequired"))
      .optional()
      .or(z.literal("")),
    date: z
      .string()
      .min(1, validationMessage("dateRequired"))
      .optional()
      .or(z.literal("")),
    startTime: z
      .string()
      .min(1, validationMessage("startTimeRequired"))
      .optional()
      .or(z.literal("")),
    endTime: z
      .string()
      .min(1, validationMessage("endTimeRequired"))
      .optional()
      .or(z.literal("")),
    maxCapacity: z.coerce
      .number({
        error: validationError("capacityRequired"),
      })
      .int(validationMessage("integerRequired"))
      .min(1, validationMessage("capacityMin"))
      .max(1000, validationMessage("capacityMax"))
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
      error: validationError("endAfterStart"),
      path: ["endTime"],
    },
  );

export const updateClassTemplateSchema = z
  .object({
    activityId: z
      .string()
      .min(1, validationMessage("activityRequired"))
      .optional()
      .or(z.literal("")),

    professorId: z
      .string()
      .min(1, validationMessage("professorRequired"))
      .optional()
      .or(z.literal("")),

    dayOfWeek: z
      .string()
      .min(1, validationMessage("dayRequired"))
      .optional()
      .or(z.literal("")),

    startTime: z
      .string()
      .min(1, validationMessage("startTimeRequired"))
      .optional()
      .or(z.literal("")),

    endTime: z
      .string()
      .min(1, validationMessage("endTimeRequired"))
      .optional()
      .or(z.literal("")),

    maxCapacity: z.coerce
      .number({
        error: validationError("capacityRequired"),
      })
      .int(validationMessage("integerRequired"))
      .min(1, validationMessage("capacityMin"))
      .max(1000, validationMessage("capacityMax"))
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
      error: validationError("endAfterStart"),
      path: ["endTime"],
    },
  );
