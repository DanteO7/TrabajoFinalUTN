import { X } from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import Modal from "../modals/modal";
import ErrorModal from "../modals/error-modal";
import {
  createInvitation,
  deleteInvitation,
  getInvitationByTenant,
} from "../../services/invitation";
import BlackButton from "../buttons/black-button";
import WhiteButton from "../buttons/white-button";
import RedButton from "../buttons/red-button";
import { Trash2 } from "lucide-react";
import { Copy } from "lucide-react";
import { Check } from "lucide-react";

export default function LinkModal({ tenantId, close, role }) {
  const queryClient = useQueryClient();

  const [backendError, setBackendError] = useState();
  const [errorModal, setErrorModal] = useState(false);

  const [copied, setCopied] = useState(false);

  const copyPaymentData = async (value) => {
    try {
      await navigator.clipboard.writeText(value);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("No se pudo copiar:", error);
    }
  };
  const { data: currentInvitation, isLoading } = useQuery({
    queryKey: ["invitation", tenantId, role],
    queryFn: () => getInvitationByTenant(tenantId, role),
    retry: false,
    refetchOnWindowFocus: false,
  });

  const mutation = useMutation({
    mutationFn: () =>
      createInvitation({
        tenantId,
        role,
      }),

    onSuccess: (data) => {
      queryClient.setQueryData(["invitation", tenantId, role], data);
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

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteInvitation(id),
    onSuccess: () => {
      queryClient.setQueryData(["invitation", tenantId, role], null);
    },
    onError: (error) => {
      const data = error?.response?.data;
      let msg = "Error al eliminar el link.";
      if (data?.message) msg = data.message;

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
        Invitar {role == "Student" ? "Alumno" : "Profesor"}
      </h2>

      {isLoading ? (
        <p className="text-center text-gray-500">Cargando...</p>
      ) : hasValidLink ? (
        <>
          <div className="border rounded-xl p-4 bg-[#efefef] mb-4">
            <p className="font-semibold mb-3">Link de invitación activo</p>

            <input
              readOnly
              value={currentInvitation.link}
              className="w-full border rounded-xl px-3 py-2 bg-white mb-3"
            />

            <BlackButton
              type="button"
              text={copied ? "Copiado" : "Copiar"}
              textSmall
              img={copied ? <Check size={16} /> : <Copy size={16} />}
              onClick={() => copyPaymentData(currentInvitation.link)}
              className="flex items-center gap-2 shrink-0 px-3 py-2 rounded-lg text-sm text-gray-600 hover:text-black hover:bg-white transition cursor-pointer"
            />

            <p className="text-sm text-gray-600 mt-2">
              Expira el:{" "}
              {new Date(currentInvitation.expirationDate).toLocaleDateString(
                "es-AR",
              )}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <WhiteButton
              disabled={mutation.isPending}
              text={mutation.isPending ? "Generando..." : "Generar nuevo link"}
              onClick={() => mutation.mutate()}
              textSmall={true}
            />
            {hasValidLink && (
              <RedButton
                text={
                  deleteMutation.isPending ? "Eliminando..." : "Eliminar link"
                }
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(currentInvitation.id)}
                textSmall={true}
              />
            )}
          </div>
        </>
      ) : (
        <>
          {isExpired && (
            <p className="text-center text-red-500 font-semibold mb-4">
              El link ha expirado. Genera uno nuevo.
            </p>
          )}

          <BlackButton
            disabled={mutation.isPending}
            text={mutation.isPending ? "Generando..." : "Generar nuevo link"}
            onClick={() => mutation.mutate()}
            textSmall={true}
          />
        </>
      )}

      {errorModal && (
        <ErrorModal
          close={() => setErrorModal(false)}
          message={backendError}
          isSuccesOrError
        />
      )}
    </Modal>
  );
}
