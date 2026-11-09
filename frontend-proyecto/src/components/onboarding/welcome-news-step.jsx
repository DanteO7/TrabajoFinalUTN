import { useState } from "react";
import Loading from "../loading";
import BlackButton from "../buttons/black-button";
import NewsForm from "../news/news-form";
import {
  getWelcomeNewsContent,
  getWelcomeNewsTitle,
} from "./welcome-news-content";
import { useTranslation } from "react-i18next";

export default function WelcomeNewsStep({
  tenantId,
  tenantName,
  isLoading,
  isError,
  isComplete,
  onRetry,
  onCreated,
}) {
  const { t } = useTranslation();
  const [openForm, setOpenForm] = useState(false);

  if (isLoading) {
    return <Loading />;
  }

  if (isError || !tenantName) {
    return (
      <div className="mt-6">
        <p className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">
          {t("onboardingSteps.newsLoadError")}
        </p>
        <button type="button" onClick={onRetry} className="mt-3 underline">
          {t("onboardingSteps.retry")}
        </button>
      </div>
    );
  }

  const welcomeTitle = getWelcomeNewsTitle(tenantName);
  const welcomeContent = getWelcomeNewsContent(tenantName);

  return (
    <div className="mt-6 flex flex-col gap-5">
      <p className="text-gray-600">
        {isComplete
          ? t("onboardingSteps.newsComplete")
          : t("onboardingSteps.newsDescription")}
      </p>

      {!isComplete && (
        <BlackButton
          text={t("onboardingSteps.createWelcomeNews")}
          onClick={() => setOpenForm(true)}
          wfit
          textSmall
        />
      )}

      {openForm && (
        <NewsForm
          tenantId={tenantId}
          close={() => setOpenForm(false)}
          initialTitle={welcomeTitle}
          initialContent={welcomeContent}
          tenantOnly
          onCreated={onCreated}
        />
      )}
    </div>
  );
}
