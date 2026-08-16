import { X, Pencil } from "lucide-react";
import { useState } from "react";
import Modal from "../modals/modal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateActivity, deleteActivity } from "../../services/activity";
import SuccessModal from "../modals/success-modal";
import ErrorModal from "../modals/error-modal";
import { useTenantStore } from "../../store/tenant-store";
import ConfirmModal from "../modals/confirm-modal";
import WhiteButton from "../buttons/white-button";
import BlackButton from "../buttons/black-button";
import RedButton from "../buttons/red-button";
import { Trash2 } from "lucide-react";

export default function ActivityModal({ activity, tenantId, close }) {
  const queryClient = useQueryClient();

  const userRoles = useTenantStore(
    (state) => state.userRolesInTenant[tenantId],
  );
  const isTenant = userRoles?.roles?.includes("Tenant");

  const [editing, setEditing] = useState(false);
  const [currentActivity, setCurrentActivity] = useState(activity);
  const [name, setName] = useState(currentActivity.name);
  const [description, setDescription] = useState(
    currentActivity.description || "",
  );

  const [backendError, setBackendError] = useState();
  const [errorModal, setErrorModal] = useState(false);

  const [successMessage, setSuccessMessage] = useState();
  const [successModal, setSuccessModal] = useState(false);

  const [confirmModal, setConfirmModal] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: () => deleteActivity(currentActivity.id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["getActivities", tenantId],
      });

      queryClient.invalidateQueries({
        queryKey: ["getClasses", tenantId],
      });

      setConfirmModal(false);

      setSuccessMessage("Actividad eliminada correctamente");
      setSuccessModal(true);

      setTimeout(() => {
        close();
      }, 3000);
    },

    onError: (error) => {
      const data = error?.response?.data;

      let msg = "Ocurrió un error al eliminar la actividad";

      if (typeof data === "string") msg = data;
      else if (data?.errors)
        msg = Object.values(data.errors).flat().join(" - ");
      else if (data?.message) msg = data.message;

      setConfirmModal(false);
      setBackendError(msg);
      setErrorModal(true);
    },
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      updateActivity(currentActivity.id, {
        name,
        description,
      }),

    onSuccess: (updatedActivity) => {
      queryClient.invalidateQueries({
        queryKey: ["getActivities", tenantId],
      });

      queryClient.invalidateQueries({
        queryKey: ["getClasses", tenantId],
      });

      setSuccessMessage("Actividad actualizada correctamente");
      setSuccessModal(true);

      setCurrentActivity(updatedActivity);
      setEditing(false);

      setTimeout(() => {
        setSuccessModal(false);
      }, 3000);
    },

    onError: (error) => {
      const data = error?.response?.data;

      let msg = "Ocurrió un error al actualizar la actividad";

      if (typeof data === "string") msg = data;
      else if (data?.errors)
        msg = Object.values(data.errors).flat().join(" - ");
      else if (data?.message) msg = data.message;

      setBackendError(msg);
      setErrorModal(true);
    },
  });

  return (
    <Modal open onClose={close}>
      <button
        onClick={close}
        className="absolute top-4 right-4 text-gray-500 hover:text-black transition duration-200 cursor-pointer"
      >
        <X size={20} />
      </button>

      {!editing ? (
        <>
          <h2 className="text-2xl font-semibold mb-2">
            {currentActivity.name}
          </h2>

          <p className="text-gray-600 whitespace-pre-wrap">
            {currentActivity.description || "Sin descripción"}
          </p>

          {isTenant && (
            <div className="flex gap-2 mt-8">
              <RedButton
                text="Eliminar"
                disabled={deleteMutation.isPending}
                onClick={() => setConfirmModal(true)}
                textSmall={true}
                img={<Trash2 size={18} />}
              />
              <BlackButton
                text="Editar"
                onClick={() => setEditing(true)}
                textSmall={true}
                img={<Pencil size={18} />}
              />
            </div>
          )}
        </>
      ) : (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-center">
            Editar actividad
          </h2>

          <div>
            <label className="block text-sm font-semibold mb-2">Nombre</label>

            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-xl px-3 py-2 bg-[#efefef] focus:outline-none focus:ring-2 focus:ring-[#333]"
              placeholder="Nombre de la actividad"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Descripción (opcional)
            </label>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded-xl px-3 py-2 border border-gray-300 bg-[#efefef] resize-none focus:outline-none focus:ring-2 focus:ring-[#333]"
              placeholder="Descripción de la actividad"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <WhiteButton
              text="Cancelar"
              onClick={() => {
                setEditing(false);
                setName(currentActivity.name);
                setDescription(currentActivity.description || "");
              }}
              textSmall={true}
            />
            <BlackButton
              text={updateMutation.isPending ? "Actualizando..." : "Actualizar"}
              onClick={() => updateMutation.mutate()}
              disabled={updateMutation.isPending}
              textSmall={true}
            />
          </div>
        </div>
      )}

      {confirmModal && (
        <ConfirmModal
          title="¿Eliminar esta actividad?"
          message={`Estás por eliminar la actividad "${activity.name}". Esta acción no se puede deshacer.`}
          onConfirm={() => deleteMutation.mutate()}
          close={() => setConfirmModal(false)}
          isPending={deleteMutation.isPending}
        />
      )}

      {errorModal && (
        <ErrorModal
          close={() => setErrorModal(false)}
          message={backendError}
          isSuccesOrError={true}
        />
      )}

      {successModal && (
        <SuccessModal
          close={() => setSuccessModal(false)}
          message={successMessage}
          isSuccesOrError={true}
        />
      )}
    </Modal>
  );
}
