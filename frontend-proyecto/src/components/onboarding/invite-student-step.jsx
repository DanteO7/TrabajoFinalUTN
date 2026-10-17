import { useState } from "react";
import LinkModal from "../modals/link-modal";
import BlackButton from "../buttons/black-button";

export default function InviteStudentStep({ tenantId, isComplete }) {
  const [showLinkModal, setShowLinkModal] = useState(false);

  return (
    <div className="mt-6 flex flex-col gap-5">
      <p className="text-gray-600 mt-2">
        {isComplete
          ? "¡Muy bien! Ya tenés un enlace vigente para invitar alumnos. ¡Sigamos con el próximo paso!"
          : "Podés generar un enlace para que un alumno se una a tu espacio. Este paso es opcional y también podés hacerlo más adelante."}
      </p>

      {isComplete ? (
        <BlackButton
          text="Administrar invitación"
          onClick={() => setShowLinkModal(true)}
          wfit
          textSmall
        />
      ) : (
        <BlackButton
          text="Invitar a un alumno"
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
