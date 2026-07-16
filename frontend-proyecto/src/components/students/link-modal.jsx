import { X } from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";

import Modal from "../modals/modal";
import SuccessModal from "../modals/success-modal";
import ErrorModal from "../modals/error-modal";
import {
  createInvitation,
  getInvitationByTenant,
} from "../../services/invitation";

export default function LinkModal({ tenantId, close }) {
  const [backendError, setBackendError] = useState();
  const [errorModal, setErrorModal] = useState(false);

  const [successMessage, setSuccessMessage] = useState();
  const [successModal, setSuccessModal] = useState(false);

  // Obtener la invitación actual
  const { data: currentInvitation, isLoading } = useQuery({
    queryKey: ["invitation", tenantId],
    queryFn: () => getInvitationByTenant(tenantId),
  });

  const mutation = useMutation({
    mutationFn: () =>
      createInvitation({
        tenantId,
        role: "Student",
      }),

    onSuccess: () => {
      setSuccessMessage("Link generado correctamente.");
      setSuccessModal(true);

      setTimeout(() => {
        setSuccessModal(false);
      }, 3000);
    },

    onError: (error) => {
      const data = error?.response?.data;
      let msg = "Ocurrió un error al generar el link.";

      if (typeof data === "string") msg = data;
      else if (data?.errors)
        msg = Object.values(data.errors).flat().join(" - ");
      else if (data?.message) msg = data.message;

      setBackendError(msg);
      setErrorModal(true);
    },
  });

  const isExpired =
    currentInvitation?.expirationDate &&
    new Date(currentInvitation.expirationDate) < new Date();

  const hasValidLink = currentInvitation && !isExpired;

  return (
    <Modal open onClose={close}>
      <button
        onClick={close}
        className="absolute top-4 right-4 text-gray-500 hover:text-black transition cursor-pointer"
      >
        <X size={20} />
      </button>

      <h2 className="text-2xl font-semibold text-center mb-6">
        Invitar alumno
      </h2>

      {isLoading ? (
        <p className="text-center text-gray-500">Cargando...</p>
      ) : hasValidLink ? (
        <>
          <div className="border rounded-xl p-4 bg-[#efefef]">
            <p className="font-semibold mb-3">Link de invitación activo</p>

            <input
              readOnly
              value={currentInvitation.link}
              className="w-full border rounded-xl px-3 py-2 bg-white mb-3"
            />

            <button
              onClick={() =>
                navigator.clipboard.writeText(currentInvitation.link)
              }
              className="w-full bg-[#333] text-white rounded-xl py-2 hover:bg-gray-700 transition"
            >
              Copiar link
            </button>

            <p className="text-sm text-gray-600 mt-2">
              Expira el:{" "}
              {new Date(currentInvitation.expirationDate).toLocaleDateString(
                "es-AR",
              )}
            </p>
          </div>

          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="w-full mt-4 bg-gray-300 text-gray-700 rounded-xl py-2 hover:bg-gray-400 transition cursor-pointer disabled:opacity-50"
          >
            {mutation.isPending ? "Generando..." : "Generar nuevo link"}
          </button>
        </>
      ) : (
        <>
          {isExpired && (
            <p className="text-center text-red-500 font-semibold mb-4">
              El link ha expirado. Genera uno nuevo.
            </p>
          )}

          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="w-full bg-[#333] text-white rounded-xl py-2 hover:bg-gray-700 transition cursor-pointer disabled:opacity-50"
          >
            {mutation.isPending ? "Generando..." : "Generar link de invitación"}
          </button>
        </>
      )}

      {errorModal && (
        <ErrorModal
          close={() => setErrorModal(false)}
          message={backendError}
          isSuccesOrError
        />
      )}

      {successModal && (
        <SuccessModal
          close={() => setSuccessModal(false)}
          message={successMessage}
          isSuccesOrError
        />
      )}
    </Modal>
  );
}
