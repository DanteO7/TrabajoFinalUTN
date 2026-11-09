import { z } from "zod";
import { validationMessage } from "../utils/validation-message";

export const createPaymentSchema = z.object({
  paymentMethod: z.string().min(1, validationMessage("paymentMethodRequired")),
});
