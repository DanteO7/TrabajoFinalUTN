import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getActivities } from "../../services/activity";
import BlackButton from "../buttons/black-button";
import Loading from "../loading";
import ActivityForm from "../activities/activity-form";
import { useTranslation } from "react-i18next";

export default function ActivitiesStep({ tenantId, isComplete }) {
  const { t } = useTranslation();
  const [openForm, setOpenForm] = useState(false);

  const { isLoading, isError, refetch } = useQuery({
    queryKey: ["getActivities", tenantId],
    queryFn: () => getActivities(tenantId),
    enabled: !!tenantId,
  });

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return (
      <div className="mt-6">
        <p className="text-red-600" role="alert">
          {t("onboardingSteps.activitiesLoadError")}
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
    <div className="mt-6 flex flex-col gap-5">
      <p className="text-gray-600">
        {isComplete
          ? t("onboardingSteps.activitiesComplete")
          : t("onboardingSteps.activitiesDescription")}
      </p>
      {!isComplete && (
        <BlackButton
          text={t("onboardingSteps.createActivity")}
          onClick={() => setOpenForm(true)}
          wfit
          textSmall
        />
      )}

      {openForm && (
        <ActivityForm tenantId={tenantId} close={() => setOpenForm(false)} />
      )}
    </div>
  );
}
