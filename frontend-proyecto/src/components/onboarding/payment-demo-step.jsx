import { useState } from "react";
import BlackButton from "../buttons/black-button";
import PaymentForm from "../payments/payment-form";
import { useTranslation } from "react-i18next";

export default function PaymentDemoStep({ tenantId, isComplete, onCompleted }) {
  const { t } = useTranslation();
  const [openForm, setOpenForm] = useState(false);

  return (
    <div className="mt-6 flex flex-col gap-5">
      {!isComplete && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700">
          {t("onboardingSteps.demoWarning")}
        </div>
      )}

      {isComplete ? (
        <p className="text-gray-600">
          {t("onboardingSteps.demoComplete")}
        </p>
      ) : (
        <BlackButton
          text={t("onboardingSteps.registerPayment")}
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
