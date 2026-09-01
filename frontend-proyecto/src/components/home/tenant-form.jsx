import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import FormInput from "../form-input";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTenantSchema } from "../../schema/tenant-schema";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createTenant } from "../../services/tenant";
import { getTenantPlans } from "../../services/tenant-plan";
import ErrorModal from "../modals/error-modal";
import Modal from "../modals/modal";
import SuccessModal from "../modals/success-modal";

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
          <label className="block mb-2">Plan</label>
          <select
            className="w-full rounded-[13px] px-3 py-2 border border-gray-200 bg-[#efefef]"
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

        <div className="text-center bg-[#efefef] rounded-xl py-3">
          <p className="text-sm text-gray-600">Precio mensual</p>
          <p className="text-2xl font-semibold">${currentPlan?.price || 0}</p>
        </div>

        <button
          type="submit"
          className="mt-2 bg-[#333] text-[#efefef] rounded-[13px] py-2 hover:bg-gray-700 transition duration-300 cursor-pointer"
        >
          Contratar
        </button>
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
