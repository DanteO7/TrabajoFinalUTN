import { X } from "lucide-react";
import { useForm } from "react-hook-form";

import { useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import ErrorModal from "../modals/error-modal";
import Modal from "../modals/modal";
import SuccessModal from "../modals/success-modal";

import FormInput from "../form-input";

import { createExercise } from "../../services/exercise";

import WhiteButton from "../buttons/white-button";
import BlackButton from "../buttons/black-button";
import { zodResolver } from "@hookform/resolvers/zod";
import { createExerciseSchema } from "../../schema/exercise-schema";

export default function ExerciseForm({ tenantId, close }) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createExerciseSchema),
    defaultValues: {
      name: "",
      description: "",
    },
    mode: "onTouched",
  });

  const [backendError, setBackendError] = useState();
  const [errorModal, setErrorModal] = useState(false);

  const [successMessage, setSuccessMessage] = useState();
  const [successModal, setSuccessModal] = useState(false);

  const mutation = useMutation({
    mutationKey: ["createExercise"],

    mutationFn: createExercise,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["getExercises", tenantId],
      });

      setBackendError(null);

      setSuccessMessage("Ejercicio creado correctamente");
      setSuccessModal(true);

      setTimeout(() => {
        close();
      }, 2000);
    },

    onError: (error) => {
      const data = error?.response?.data;

      let msg = "Ocurrió un error al crear el ejercicio";

      if (typeof data === "string") {
        msg = data;
      } else if (data?.errors) {
        msg = Object.values(data.errors).flat().join(" - ");
      } else if (data?.title) {
        msg = data.title;
      } else if (data?.message) {
        msg = data.message;
      }

      setBackendError(msg);
      setErrorModal(true);
    },
  });

  const onSubmit = (form) => {
    mutation.mutate({
      name: form.name,
      description: form.description || null,
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
        Crear un ejercicio
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormInput
          label="Nombre del ejercicio"
          id="name"
          placeholder="Ej: Press banca"
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
            placeholder="Descripción del ejercicio..."
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
          <WhiteButton text="Cancelar" onClick={close} textSmall={true} />

          <BlackButton
            text={mutation.isPending ? "Creando..." : "Crear ejercicio"}
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
