import { useState } from "react";
import LinkModal from "../modals/link-modal";
import BlackButton from "../buttons/black-button";
import { useTranslation } from "react-i18next";

export default function InviteStudentStep({ tenantId, isComplete }) {
  const { t } = useTranslation();
  const [showLinkModal, setShowLinkModal] = useState(false);

  return (
    <div className="mt-6 flex flex-col gap-5">
      <p className="text-gray-600 mt-2">
        {isComplete
          ? t("onboardingSteps.studentInvited")
          : t("onboardingSteps.studentInviteDescription")}
      </p>

      {isComplete ? (
        <BlackButton
          text={t("onboardingSteps.manageInvitation")}
          onClick={() => setShowLinkModal(true)}
          wfit
          textSmall
        />
      ) : (
        <BlackButton
          text={t("onboardingSteps.inviteStudent")}
          onClick={() => setShowLinkModal(true)}
          wfit
          textSmall
        />
      )}

      {showLinkModal && (
        <LinkModal
          tenantId={tenantId}
          role="student"
          close={() => setShowLinkModal(false)}
        />
      )}
    </div>
  );
}
