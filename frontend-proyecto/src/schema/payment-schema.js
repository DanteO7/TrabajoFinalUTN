import { z } from "zod";

export const createPaymentSchema = z.object({
  paymentMethod: z.string().min(1, "Seleccioná un método de pago"),
});
