import { z } from "zod";

export const createPaymentSchema = z.object({
  selectedId: z.string().min(1, "Seleccioná una opción"),
  paymentMethod: z.string().min(1, "Seleccioná un método de pago"),
});
