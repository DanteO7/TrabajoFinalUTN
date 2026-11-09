import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getStudentPlans } from "../../services/student-plan";
import Loading from "../loading";
import BlackButton from "../buttons/black-button";
import StudentPlanForm from "../students-plan/student-plan-form";
import { useTranslation } from "react-i18next";

export default function StudentPlansStep({ tenantId, isComplete }) {
  const { t } = useTranslation();
  const [openPlanForm, setOpenPlanForm] = useState(false);

  const { isLoading, isError, refetch } = useQuery({
    queryKey: ["getStudentPlans", tenantId],
    queryFn: () => getStudentPlans(tenantId),
    enabled: !!tenantId,
  });

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return (
      <div className="mt-6">
        <p className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">
          {t("onboardingSteps.plansLoadError")}
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-3 underline"
        >
          {t("onboardingSteps.retry")}
        </button>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <p className="text-gray-600">
        {isComplete
          ? t("onboardingSteps.planComplete")
          : t("onboardingSteps.planDescription")}
      </p>

      {!isComplete && (
        <div className="mt-5">
          <BlackButton
            text={t("onboardingSteps.createPlan")}
            onClick={() => setOpenPlanForm(true)}
            wfit
            textSmall
          />
        </div>
      )}

      {openPlanForm && (
        <StudentPlanForm
          tenantId={tenantId}
          close={() => setOpenPlanForm(false)}
        />
      )}
    </div>
  );
}
