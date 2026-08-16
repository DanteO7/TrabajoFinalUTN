import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Modal from "../modals/modal";
import SuccessModal from "../modals/success-modal";
import ErrorModal from "../modals/error-modal";
import { updateTenant } from "../../services/tenant";

export default function EditAddressModal({ tenant, close }) {
  const queryClient = useQueryClient();
  const [address, setAddress] = useState(tenant.address || "");
  const [successModal, setSuccessModal] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const mutation = useMutation({
    mutationFn: () => updateTenant(tenant.id, { address }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tenantById"],
      });
      queryClient.invalidateQueries({
        queryKey: ["myTenants"],
      });

      setSuccessModal(true);
      setTimeout(() => {
        close();
      }, 2000);
    },

    onError: (error) => {
      setErrorMessage(error?.response?.data?.message || "Error al actualizar");
      setErrorModal(true);
    },
  });

  return (
    <Modal open onClose={close}>
      <h2 className="text-2xl font-semibold mb-4">Editar dirección</h2>

      <textarea
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Ingresá la dirección del negocio"
        maxLength={200}
        className="w-full border rounded-xl p-3 mb-4 h-24 resize-none"
      />

      <p className="text-sm text-gray-500 mb-4">{address.length}/200</p>

      <div className="flex justify-end gap-3">
        <button onClick={close} className="border px-4 py-2 rounded-xl">
          Cancelar
        </button>

        <button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="bg-[#333] text-white px-4 py-2 rounded-xl hover:bg-gray-700 disabled:opacity-50"
        >
          {mutation.isPending ? "Guardando..." : "Guardar"}
        </button>
      </div>

      {successModal && (
        <SuccessModal
          message="Dirección actualizada correctamente"
          close={() => setSuccessModal(false)}
          isSuccesOrError={true}
        />
      )}

      {errorModal && (
        <ErrorModal
          message={errorMessage}
          close={() => setErrorModal(false)}
          isSuccesOrError={true}
        />
      )}
    </Modal>
  );
}
