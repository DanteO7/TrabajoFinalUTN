import { useState } from "react";
import LinkModal from "../modals/link-modal";
import BlackButton from "../buttons/black-button";

export default function InviteProfessorStep({ tenantId, isComplete }) {
  const [showLinkModal, setShowLinkModal] = useState(false);

  return (
    <div className="mt-6 flex flex-col gap-5">
      <p className="text-gray-600 mt-2">
        {isComplete
          ? "¡Muy bien! Ya tenés un enlace vigente para invitar profesores. ¡Sigamos con el próximo paso!"
          : "Podés generar un enlace para que un profesor se una a tu espacio. Este paso es opcional y también podés hacerlo más adelante."}
      </p>

      {!isComplete && (
        <BlackButton
          text="Invitar a un profesor"
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
