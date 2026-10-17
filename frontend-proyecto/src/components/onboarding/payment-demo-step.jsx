import { useState } from "react";
import BlackButton from "../buttons/black-button";
import PaymentForm from "../payments/payment-form";

export default function PaymentDemoStep({ tenantId, isComplete, onCompleted }) {
  const [openForm, setOpenForm] = useState(false);

  return (
    <div className="mt-6 flex flex-col gap-5">
      {!isComplete && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700">
          Esta es una demostración interactiva con datos ficticios. No se
          realizará ningún cobro ni se guardará un pago real.
        </div>
      )}

      {isComplete ? (
        <p className="text-gray-600">
          ¡Listo! Probaste cómo registrar un pago. No se guardó ningún pago
          real.
        </p>
      ) : (
        <BlackButton
          text="Registrar pago"
          onClick={() => setOpenForm(true)}
          wfit
          textSmall
        />
      )}

      {openForm && (
        <PaymentForm
          tenantId={tenantId}
          close={() => setOpenForm(false)}
          demoMode
          onDemoCompleted={onCompleted}
        />
      )}
    </div>
  );
}
