import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import FormInput from "../form-input";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ErrorModal from "../modals/error-modal";
import Modal from "../modals/modal";
import SuccessModal from "../modals/success-modal";
import { updateStudentPlan } from "../../services/student-plan";
import { updateStudentPlanSchema } from "../../schema/students-plan-schema";
import WhiteButton from "../buttons/white-button";
import BlackButton from "../buttons/black-button";

export default function StudentPlanUpdateForm({
  planId,
  tenantId,
  plan,
  close,
}) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(updateStudentPlanSchema),
    mode: "onTouched",
    defaultValues: {
      name: plan?.name,
      classesPerMonth: plan?.classesPerMonth,
      price: plan?.price,
    },
  });

  const [backendError, setBackendError] = useState();
  const [errorModal, setErrorModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState();
  const [successModal, setSuccessModal] = useState(false);

  const mutation = useMutation({
    mutationKey: ["updateStudentPlan", planId],
    mutationFn: (data) => updateStudentPlan(planId, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["getStudentPlans", tenantId],
      });

      setSuccessMessage("Plan actualizado correctamente");
      setSuccessModal(true);
      setBackendError(null);

      setTimeout(() => {
        close();
      }, 2000);
    },

    onError: (error) => {
      const data = error?.response?.data;

      let msg = "Ocurrió un error al actualizar el plan";

      if (typeof data === "string") msg = data;
      else if (data?.errors)
        msg = Object.values(data.errors).flat().join(" - ");
      else if (data?.message) msg = data.message;
      else if (data?.title) msg = data.title;

      setBackendError(msg);
      setErrorModal(true);
    },
  });

  const onSubmit = (form) => {
    mutation.mutate({
      name: form.name,
      classesPerMonth: form.classesPerMonth
        ? parseInt(form.classesPerMonth)
        : null,
      price: form.price ? parseFloat(form.price) : null,
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
        Actualizar plan
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormInput
          label="Nombre del plan"
          placeholder="Ej: Plan Mensual, Plan Trimestral..."
          register={register("name")}
          error={errors.name}
        />

        <FormInput
          label="Clases por mes"
          type="number"
          placeholder="Ej: 8, 12, 16..."
          register={register("classesPerMonth")}
          error={errors.classesPerMonth}
        />

        <FormInput
          label="Precio"
          type="number"
          step="0.01"
          placeholder="Ej: 3000, 5000..."
          register={register("price")}
          error={errors.price}
        />
        <div className="grid grid-cols-2 gap-3">
          <WhiteButton text="Cancelar" onClick={close} textSmall={true} />
          <BlackButton
            text={mutation.isPending ? "Actualizando..." : "Actualizar plan"}
            disabled={mutation.isPending}
            type="submit"
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
