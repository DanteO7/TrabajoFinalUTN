import { X, Pencil } from "lucide-react";
import { useState } from "react";
import Modal from "../modals/modal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateActivity, deleteActivity } from "../../services/activity";
import SuccessModal from "../modals/success-modal";
import ErrorModal from "../modals/error-modal";
import { useTenantStore } from "../../store/tenant-store";

export default function ActivityModal({ activity, tenantId, close }) {
  const queryClient = useQueryClient();

  const getUserRoles = useTenantStore((state) => state.getUserRoles);
  const userRoles = getUserRoles(tenantId);
  const isTenant = userRoles?.roles?.includes("Tenant");

  const [editing, setEditing] = useState(false);
  const [currentActivity, setCurrentActivity] = useState(activity);
  const [deleteModal, setDeleteModal] = useState(false);
  const [name, setName] = useState(currentActivity.name);
  const [description, setDescription] = useState(
    currentActivity.description || "",
  );

  const [backendError, setBackendError] = useState();
  const [errorModal, setErrorModal] = useState(false);

  const [successMessage, setSuccessMessage] = useState();
  const [successModal, setSuccessModal] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: () => deleteActivity(currentActivity.id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["getActivities", tenantId],
      });

      setDeleteModal(false);

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

          {currentActivity.description && (
            <p className="text-gray-600 mb-6">{currentActivity.description}</p>
          )}

          {isTenant && (
            <div className="flex justify-end gap-3 max-[360px]:text-[13px]">
              <button
                onClick={() => setDeleteModal(true)}
                className="text-red-600 border border-red-600 rounded-xl px-4 py-2 hover:bg-red-600 hover:text-white transition cursor-pointer"
              >
                Eliminar actividad
              </button>

              <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 bg-[#333] text-white px-4 py-2 rounded-xl hover:bg-gray-700"
              >
                <Pencil size={18} />
                Editar
              </button>
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

          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setEditing(false);
                setName(currentActivity.name);
                setDescription(currentActivity.description || "");
              }}
              className="border px-4 py-2 rounded-xl"
            >
              Cancelar
            </button>

            <button
              onClick={() => updateMutation.mutate()}
              disabled={updateMutation.isPending}
              className="bg-[#333] text-white px-4 py-2 rounded-xl hover:bg-gray-700 disabled:opacity-50"
            >
              {updateMutation.isPending ? "Actualizando..." : "Actualizar"}
            </button>
          </div>
        </div>
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

      {deleteModal && (
        <Modal open onClose={() => setDeleteModal(false)}>
          <h2 className="text-2xl font-semibold text-center">
            Eliminar actividad
          </h2>

          <p className="text-center mt-5">
            ¿Seguro que querés eliminar la actividad{" "}
            <span className="font-semibold">{currentActivity.name}</span>?
          </p>

          <p className="text-center text-gray-500 mt-2">
            Esta acción no se puede deshacer.
          </p>

          <div className="flex justify-end gap-3 mt-8">
            <button
              onClick={() => setDeleteModal(false)}
              className="border rounded-xl px-4 py-2"
            >
              Cancelar
            </button>

            <button
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              className="bg-red-600 text-white rounded-xl px-4 py-2 hover:bg-red-700 disabled:opacity-50"
            >
              {deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
            </button>
          </div>
        </Modal>
      )}
    </Modal>
  );
}
