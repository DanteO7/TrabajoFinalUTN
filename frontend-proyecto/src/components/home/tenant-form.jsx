import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTenantSchema } from "../../schema/tenant-schema";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createTenant } from "../../services/tenant";
import { getTenantPlans } from "../../services/tenant-plan";
import ErrorModal from "../modals/error-modal";
import Modal from "../modals/modal";
import SuccessModal from "../modals/success-modal";
import FormInput from "../inputs/form-input";
import BlackButton from "../buttons/black-button";

export default function TenantForm({ close, selectedPlan, setSelectedPlan }) {
  const { data: plans, isLoading } = useQuery({
    queryKey: ["tenantsPlan"],
    queryFn: getTenantPlans,
  });

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createTenantSchema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      tenantPlanId: selectedPlan?.id || "",
    },
  });

  const [backendError, setBackendError] = useState();
  const [errorModal, setErrorModal] = useState(false);
  const [succesMessage, setSuccessMessage] = useState();
  const [succesModal, setSuccesModal] = useState(false);

  const mutation = useMutation({
    mutationKey: ["createTenant"],
    mutationFn: createTenant,
    onSuccess: () => {
      setSuccessMessage("Negocio creado correctamente");
      setSuccesModal(true);
      setBackendError(null);

      setTimeout(() => {
        close();
      }, 2000);
    },
    onError: (error) => {
      const data = error?.response?.data;
      let msg = "Ocurrió un error al crear tu negocio";
      if (typeof data === "string") msg = data;
      else if (data?.errors)
        msg = Object.values(data.errors).flat().join(" - ");
      else if (data?.title) msg = data.title;
      setBackendError(msg);
      setErrorModal(true);
    },
  });

  const selectedPlanId = Number(watch("tenantPlanId"));
  const currentPlan = plans.find((p) => p.id === selectedPlanId);

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  useEffect(() => {
    reset({
      name: "",
      tenantPlanId: selectedPlan?.id || "",
    });
  }, [selectedPlan, reset]);

  const handleClose = () => {
    setSelectedPlan(null);
    close();
  };

  return (
    <Modal open={true} onClose={handleClose}>
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 text-gray-500 hover:text-black transition duration-200 cursor-pointer"
      >
        <X size={20} />
      </button>

      <h2 className="text-2xl font-semibold mb-4 text-center">
        Crear tu negocio
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormInput
          label="Nombre del negocio"
          id="name"
          placeholder="Ej: Gym Power"
          register={register("name")}
          error={errors.name}
        />

        <div>
          <label className="block text-sm font-medium mb-1">Plan</label>
          <select
            className="rounded-lg w-full px-3 pt-1.75 pb-2 text-gray-600 cursor-pointer bg-[#f1eef3] border border-gray-400 outline-none focus:ring-[1.5px] focus:border-transparent transition-all duration-200"
            {...register("tenantPlanId")}
          >
            <option value="">
              {isLoading ? "Cargando..." : "Seleccionar plan"}
            </option>
            {plans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.name}
              </option>
            ))}
          </select>

          {errors.tenantPlanId && (
            <p className="text-red-500 text-sm mt-1">
              {errors.tenantPlanId.message}
            </p>
          )}
        </div>

        <div className="bg-[#F1EEF3] rounded-lg border border-gray-400 shadow-md p-4 text-center">
          <p className="text-sm text-gray-600">Precio mensual</p>
          <p className="text-2xl font-semibold">${currentPlan?.price || 0}</p>
        </div>

        <BlackButton text="Contratar" type="submit" textSmall />
      </form>
      {errorModal && (
        <ErrorModal
          close={() => setErrorModal(false)}
          message={backendError}
          isSuccesOrError={true}
        />
      )}
      {succesModal && (
        <SuccessModal
          close={() => setSuccesModal(false)}
          message={succesMessage}
          isSuccesOrError={true}
        />
      )}
    </Modal>
  );
}
