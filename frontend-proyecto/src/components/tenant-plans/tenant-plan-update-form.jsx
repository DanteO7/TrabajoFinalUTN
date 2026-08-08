import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import FormInput from "../form-input";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ErrorModal from "../modals/error-modal";
import Modal from "../modals/modal";
import SuccessModal from "../modals/success-modal";
import { updateTenantPlan } from "../../services/tenant-plan";
import { updateTenantPlanSchema } from "../../schema/tenant-plans-schema";

export default function TenantPlanUpdateForm({ planId, plan, close }) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(updateTenantPlanSchema),
    mode: "onTouched",
    defaultValues: {
      name: plan?.name,
      price: plan?.price,
      maxStudents: plan?.maxStudents,
      maxProfessors: plan?.maxProfessors,
    },
  });

  const [backendError, setBackendError] = useState();
  const [errorModal, setErrorModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState();
  const [successModal, setSuccessModal] = useState(false);

  const mutation = useMutation({
    mutationKey: ["updateStudentPlan", planId],
    mutationFn: (data) => updateTenantPlan(planId, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["getTenantPlans"],
      });

      setSuccessMessage("Plan actualizado correctamente");
      setSuccessModal(true);
      setBackendError(null);

      setTimeout(() => {
        close();
      }, 3000);
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
      price: form.price ? parseFloat(form.price) : null,
      maxStudents: form.maxStudents,
      maxProfessors: form.maxProfessors,
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
          placeholder="Ej: Plan Premium, Plan Basico..."
          register={register("name")}
          error={errors.name}
        />

        <FormInput
          label="Precio"
          type="number"
          step="0.01"
          placeholder="Ej: 3000, 5000..."
          register={register("price")}
          error={errors.price}
        />

        <FormInput
          label="Maximos alumnos"
          type="number"
          placeholder="Ej: 8, 12, 16..."
          register={register("maxStudents")}
          error={errors.maxStudents}
        />

        <FormInput
          label="Maximos profesores"
          type="number"
          placeholder="Ej: 8, 12, 16..."
          register={register("maxProfessors")}
          error={errors.maxProfessors}
        />

        <button
          type="submit"
          disabled={mutation.isPending}
          className="mt-2 bg-[#333] text-white rounded-[13px] py-2 hover:bg-gray-700 transition duration-300 cursor-pointer disabled:opacity-50"
        >
          {mutation.isPending ? "Actualizando..." : "Actualizar plan"}
        </button>
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
