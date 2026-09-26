import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ErrorModal from "../modals/error-modal";
import Modal from "../modals/modal";
import SuccessModal from "../modals/success-modal";
import { createSpeciality } from "../../services/speciality";
import { createSpecialitySchema } from "../../schema/speciality-schema";
import WhiteButton from "../buttons/white-button";
import BlackButton from "../buttons/black-button";
import FormInput from "../inputs/form-input";

export default function SpecialityForm({ tenantId, close }) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createSpecialitySchema),
    mode: "onTouched",
  });

  const [backendError, setBackendError] = useState();
  const [errorModal, setErrorModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState();
  const [successModal, setSuccessModal] = useState(false);

  const mutation = useMutation({
    mutationKey: ["createSpeciality"],
    mutationFn: createSpeciality,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["getSpecialities", tenantId],
      });

      setSuccessMessage("Especialidad creada correctamente");
      setSuccessModal(true);
      setBackendError(null);

      setTimeout(() => {
        close();
      }, 2000);
    },

    onError: (error) => {
      const data = error?.response?.data;

      let msg = "Ocurrió un error al crear la especialidad";

      if (typeof data === "string") msg = data;
      else if (data?.errors)
        msg = Object.values(data.errors).flat().join(" - ");
      else if (data?.title) msg = data.title;

      setBackendError(msg);
      setErrorModal(true);
    },
  });

  const onSubmit = (form) => {
    mutation.mutate({
      name: form.name,
      description: form.description,
      tenantId,
    });
  };

  return (
    <Modal open={true} onClose={close}>
      <button
        onClick={close}
        className="absolute top-4 right-4 text-gray-500 hover:text-black transition duration-200 cursor-pointer"
      >
        <X size={20} />
      </button>

      <h2 className="text-2xl font-semibold mb-4 text-center">
        Crear una profesión
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormInput
          label="Nombre de la profesión"
          placeholder="Ej: Kinesiólogo, Instructor de Pilates..."
          register={register("name")}
          error={errors.name}
        />
        <FormInput
          textarea
          label="Descripción (opcional)"
          register={register("description")}
          error={errors.description}
          placeholder="Explicación de la profesión..."
        />

        <div className="grid grid-cols-2 gap-3">
          <WhiteButton text="Cancelar" onClick={close} textSmall={true} />
          <BlackButton
            text={mutation.isPending ? "Creando..." : "Crear profesión"}
            type="submit"
            disabled={mutation.isPending}
            textSmall={true}
          />
        </div>
      </form>

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
