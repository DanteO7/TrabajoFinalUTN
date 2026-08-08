import { X, Pencil } from "lucide-react";
import { useState } from "react";
import Modal from "../modals/modal";
import { useForm } from "react-hook-form";
import FormInput from "../form-input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateSpeciality, deleteSpeciality } from "../../services/speciality";
import SuccessModal from "../modals/success-modal";
import ErrorModal from "../modals/error-modal";
import ConfirmModal from "../modals/confirm-modal";

export default function SpecialityModal({ speciality, tenantId, close }) {
  const [editing, setEditing] = useState(false);
  const [currentSpeciality, setCurrentSpeciality] = useState(speciality);

  const [backendError, setBackendError] = useState();
  const [errorModal, setErrorModal] = useState(false);

  const [successMessage, setSuccessMessage] = useState();
  const [successModal, setSuccessModal] = useState(false);

  const [confirmModal, setConfirmModal] = useState(false);

  const queryClient = useQueryClient();

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      name: speciality.name,
      description: speciality.description,
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteSpeciality(currentSpeciality.id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["getSpecialities", tenantId],
      });

      setConfirmModal(false);

      setSuccessMessage("Profesión eliminada correctamente");
      setSuccessModal(true);

      setTimeout(() => {
        close();
      }, 3000);
    },

    onError: (error) => {
      setConfirmModal(false);
      const data = error?.response?.data;

      let msg = "Ocurrió un error al eliminar la profesión";

      if (typeof data === "string") msg = data;
      else if (data?.errors)
        msg = Object.values(data.errors).flat().join(" - ");
      else if (data?.title) msg = data.title;

      setBackendError(msg);
      setErrorModal(true);
    },
  });

  const mutation = useMutation({
    mutationFn: (data) => updateSpeciality(currentSpeciality.id, data),

    onSuccess: (updatedSpeciality) => {
      queryClient.invalidateQueries({
        queryKey: ["getSpecialities", tenantId],
      });

      setSuccessMessage("Profesión actualizada correctamente");
      setSuccessModal(true);

      setCurrentSpeciality(updatedSpeciality);

      reset(updatedSpeciality);

      setEditing(false);

      setTimeout(() => {
        setSuccessModal(false);
      }, 3000);
    },

    onError: (error) => {
      const data = error?.response?.data;

      let msg = "Ocurrió un error al actualizar la profesión";

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
            {currentSpeciality.name}
          </h2>

          <p className="text-gray-600 whitespace-pre-wrap">
            {currentSpeciality.description || "Sin descripción"}
          </p>

          <div className="grid grid-cols-2 gap-3 mt-8 max-[360px]:text-[14px] text-center">
            <button
              onClick={() => setConfirmModal(true)}
              className="flex-1 rounded-xl bg-red-500 py-2.5 text-white hover:bg-red-600 transition cursor-pointer duration-200"
            >
              Eliminar
            </button>

            <button
              onClick={() => setEditing(true)}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#333] py-2.5 text-white hover:bg-[#222] transition cursor-pointer duration-200"
            >
              <Pencil size={18} />
              Editar
            </button>
          </div>
        </>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold text-center">Editar</h2>

          <FormInput label="Nombre" register={register("name")} />

          <div>
            <label className="block mb-2">Descripción</label>

            <textarea
              rows={4}
              {...register("description")}
              className="w-full rounded-xl bg-[#efefef] border px-3 py-2 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
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
              Guardar
            </button>
          </div>
        </form>
      )}

      {confirmModal && (
        <ConfirmModal
          title="¿Eliminar esta profesión?"
          message={`Estás por eliminar la profesion "${speciality.name}". Esta acción no se puede deshacer.`}
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
