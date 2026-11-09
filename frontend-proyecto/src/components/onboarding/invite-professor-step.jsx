import { useState } from "react";
import LinkModal from "../modals/link-modal";
import BlackButton from "../buttons/black-button";
import { useTranslation } from "react-i18next";

export default function InviteProfessorStep({ tenantId, isComplete }) {
  const { t } = useTranslation();
  const [showLinkModal, setShowLinkModal] = useState(false);

  return (
    <div className="mt-6 flex flex-col gap-5">
      <p className="text-gray-600 mt-2">
        {isComplete
          ? t("onboardingSteps.professorInvited")
          : t("onboardingSteps.professorInviteDescription")}
      </p>

      {!isComplete && (
        <BlackButton
          text={t("onboardingSteps.inviteProfessor")}
          onClick={() => setShowLinkModal(true)}
          wfit
          textSmall
        />
      )}

      {showLinkModal && (
        <LinkModal
          tenantId={tenantId}
          role="professor"
          close={() => setShowLinkModal(false)}
        />
      )}
    </div>
  );
}
