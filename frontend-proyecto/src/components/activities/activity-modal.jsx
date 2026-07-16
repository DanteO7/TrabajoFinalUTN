import { X, Pencil } from "lucide-react";
import { useState } from "react";
import Modal from "../modals/modal";
import { useForm } from "react-hook-form";
import FormInput from "../form-input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateActivity, deleteActivity } from "../../services/activity";
import SuccessModal from "../modals/success-modal";
import ErrorModal from "../modals/error-modal";

export default function ActivityModal({ activity, tenantId, close }) {
  const [editing, setEditing] = useState(false);
  const [currentActivity, setCurrentActivity] = useState(activity);
  const [deleteModal, setDeleteModal] = useState(false);

  const [backendError, setBackendError] = useState();
  const [errorModal, setErrorModal] = useState(false);

  const [successMessage, setSuccessMessage] = useState();
  const [successModal, setSuccessModal] = useState(false);

  const queryClient = useQueryClient();

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: activity.name,
      description: activity.description,
    },
  });

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
      else if (data?.title) msg = data.title;

      setBackendError(msg);
      setErrorModal(true);
    },
  });

  const mutation = useMutation({
    mutationFn: (data) => updateActivity(activity.id, data),

    onSuccess: (updatedActivity) => {
      queryClient.invalidateQueries({
        queryKey: ["getActivities", tenantId],
      });

      setSuccessMessage("Actividad actualizada correctamente");
      setSuccessModal(true);

      setCurrentActivity(updatedActivity);

      reset(updatedActivity);

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
      else if (data?.title) msg = data.title;

      setBackendError(msg);
      setErrorModal(true);
    },
  });

  const onSubmit = (form) => {
    mutation.mutate(form);
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
          <h2 className="text-2xl font-semibold mb-5">
            {currentActivity.name}
          </h2>

          <p className="text-gray-600 whitespace-pre-wrap">
            {currentActivity.description || "Sin descripción"}
          </p>

          <div className="flex justify-end gap-3 mt-8 max-[360px]:text-[13px]">
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
        </>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold text-center">
            Editar actividad
          </h2>

          <FormInput label="Nombre" register={register("name")} />

          <div>
            <label className="block mb-2">Descripción</label>

            <textarea
              rows={4}
              {...register("description")}
              className="w-full rounded-xl bg-[#efefef] border px-3 py-2 resize-none"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                reset();
                setEditing(false);
              }}
              className="border px-4 py-2 rounded-xl"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="bg-[#333] text-white px-4 py-2 rounded-xl hover:bg-gray-700"
            >
              Guardar cambios
            </button>
          </div>
        </form>
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
            <span className="font-semibold">"{currentActivity.name}"</span>?
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
              className="bg-red-600 text-white rounded-xl px-4 py-2 hover:bg-red-700"
            >
              Eliminar
            </button>
          </div>
        </Modal>
      )}
    </Modal>
  );
}
