import { X, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Modal from "../modals/modal";
import { updateActivity, deleteActivity } from "../../services/activity";
import SuccessModal from "../modals/success-modal";
import ErrorModal from "../modals/error-modal";
import ConfirmModal from "../modals/confirm-modal";
import { useTenantStore } from "../../store/tenant-store";
import WhiteButton from "../buttons/white-button";
import BlackButton from "../buttons/black-button";
import RedButton from "../buttons/red-button";
import { updateActivitySchema } from "../../schema/activity-schema";
import FormInput from "../form-input";

export default function ActivityModal({ activity, tenantId, close }) {
  const queryClient = useQueryClient();

  const userRoles = useTenantStore(
    (state) => state.userRolesInTenant[tenantId],
  );

  const isTenant = userRoles?.roles?.includes("Tenant");

  const [editing, setEditing] = useState(false);
  const [currentActivity, setCurrentActivity] = useState(activity);

  const [backendError, setBackendError] = useState();
  const [errorModal, setErrorModal] = useState(false);

  const [successMessage, setSuccessMessage] = useState();
  const [successModal, setSuccessModal] = useState(false);

  const [confirmModal, setConfirmModal] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(updateActivitySchema),
    defaultValues: {
      name: activity.name || "",
      description: activity.description || "",
    },
    mode: "onTouched",
  });

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
      }, 2000);
    },

    onError: (error) => {
      const data = error?.response?.data;

      let msg = "Ocurrió un error al eliminar la actividad";

      if (typeof data === "string") {
        msg = data;
      } else if (data?.errors) {
        msg = Object.values(data.errors).flat().join(" - ");
      } else if (data?.message) {
        msg = data.message;
      }

      setConfirmModal(false);
      setBackendError(msg);
      setErrorModal(true);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) =>
      updateActivity(currentActivity.id, {
        name: data.name,
        description: data.description,
      }),

    onSuccess: (updatedActivity) => {
      queryClient.invalidateQueries({
        queryKey: ["getActivities", tenantId],
      });

      queryClient.invalidateQueries({
        queryKey: ["getClasses", tenantId],
      });

      setCurrentActivity(updatedActivity);

      reset({
        name: updatedActivity.name || "",
        description: updatedActivity.description || "",
      });

      setEditing(false);

      setSuccessMessage("Actividad actualizada correctamente");
      setSuccessModal(true);

      setTimeout(() => {
        setSuccessModal(false);
      }, 2000);
    },

    onError: (error) => {
      const data = error?.response?.data;

      let msg = "Ocurrió un error al actualizar la actividad";

      if (typeof data === "string") {
        msg = data;
      } else if (data?.errors) {
        msg = Object.values(data.errors).flat().join(" - ");
      } else if (data?.message) {
        msg = data.message;
      }

      setBackendError(msg);
      setErrorModal(true);
    },
  });

  const handleUpdate = (data) => {
    updateMutation.mutate(data);
  };

  const handleCancelEdit = () => {
    setEditing(false);

    reset({
      name: currentActivity.name || "",
      description: currentActivity.description || "",
    });
  };

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
        <form onSubmit={handleSubmit(handleUpdate)} className="space-y-6">
          <h2 className="text-2xl font-semibold text-center">
            Editar actividad
          </h2>

          <FormInput
            label="Nombre de la actividad"
            id="name"
            placeholder="Ej: Musculación"
            register={register("name")}
            error={errors.name}
          />

          <div>
            <label htmlFor="description" className="block mb-2">
              Descripción (opcional)
            </label>

            <textarea
              id="description"
              rows={4}
              placeholder="Descripción de la actividad..."
              {...register("description")}
              className="w-full rounded-[13px] px-3 py-2 border border-gray-300 bg-[#efefef] resize-none focus:outline-none focus:ring-2 focus:ring-[#333]"
            />

            {errors.description && (
              <p className="text-red-500 text-[13px] mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <WhiteButton
              text="Cancelar"
              onClick={handleCancelEdit}
              textSmall={true}
            />

            <BlackButton
              text={updateMutation.isPending ? "Actualizando..." : "Actualizar"}
              type="submit"
              disabled={updateMutation.isPending}
              textSmall={true}
            />
          </div>
        </form>
      )}

      {confirmModal && (
        <ConfirmModal
          title="¿Eliminar esta actividad?"
          message={`Estás por eliminar la actividad "${currentActivity.name}". Esta acción no se puede deshacer.`}
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
