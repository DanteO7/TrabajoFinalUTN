import { X, Pencil } from "lucide-react";
import { useState } from "react";
import Modal from "../modals/modal";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateSpeciality, deleteSpeciality } from "../../services/speciality";
import SuccessModal from "../modals/success-modal";
import ErrorModal from "../modals/error-modal";
import ConfirmModal from "../modals/confirm-modal";
import RedButton from "../buttons/red-button";
import BlackButton from "../buttons/black-button";
import { Trash2 } from "lucide-react";
import WhiteButton from "../buttons/white-button";
import FormInput from "../inputs/form-input";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateSpecialitySchema } from "../../schema/speciality-schema";

export default function SpecialityModal({ speciality, tenantId, close }) {
  const [editing, setEditing] = useState(false);
  const [currentSpeciality, setCurrentSpeciality] = useState(speciality);

  const [backendError, setBackendError] = useState();
  const [errorModal, setErrorModal] = useState(false);

  const [successMessage, setSuccessMessage] = useState();
  const [successModal, setSuccessModal] = useState(false);

  const [confirmModal, setConfirmModal] = useState(false);

  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(updateSpecialitySchema),
    mode: "onTouched",
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
      }, 2000);
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
      }, 2000);
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
        </>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold text-center">Editar</h2>

          <FormInput
            label="Nombre"
            placeholder="Ej: Kinesiólogo, Instructor de Pilates..."
            register={register("name")}
            error={errors.name}
          />

          <FormInput
            textarea
            label="Descripción (opcional)"
            register={register("description")}
            error={errors.description}
            placeholder="Explicación de la profesón..."
          />

          <div className="grid grid-cols-2 gap-3">
            <WhiteButton
              text="Cancelar"
              onClick={() => {
                reset();
                setEditing(false);
              }}
              textSmall={true}
            />
            <BlackButton
              text={mutation.isPending ? "Actualizando..." : "Actualizar"}
              type="submit"
              disabled={mutation.isPending}
              textSmall={true}
            />
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
