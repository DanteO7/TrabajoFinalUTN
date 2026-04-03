import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import FormInput from "../form-input";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTenantSchema } from "../../schema/tenant-schema";
import { useMutation } from "@tanstack/react-query";
import { createTenant } from "../../services/tenant";

export default function TenantForm({ onClose, selectedPlan, setSelectedPlan }) {
  const plans = [
    { id: 1, name: "Básico", price: 30000 },
    { id: 2, name: "Premium", price: 35000 },
  ];

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createTenantSchema),

    defaultValues: {
      name: "",
      tenantPlanId: selectedPlan?.id || "",
    },
  });

  const [backendError, setBackendError] = useState();

  const mutation = useMutation({
    mutationKey: ["createTenant"],
    mutationFn: createTenant,
    onError: (error) => {
      const msg =
        error?.response?.data?.message || "Ocurrió un error al registrarte";

      setBackendError(msg);
    },
  });

  const [isClosing, setIsClosing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const selectedPlanId = Number(watch("tenantPlanId"));
  const currentPlan = plans.find((p) => p.id === selectedPlanId);

  const onSubmit = (data) => {
    console.log(data);
    mutation.mutate(data);
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  useEffect(() => {
    reset({
      name: "",
      tenantPlanId: selectedPlan?.id || "",
    });
  }, [selectedPlan, reset]);

  const handleClose = () => {
    setIsClosing(true);

    setTimeout(() => {
      setSelectedPlan(null);
      onClose();
    }, 200);
  };

  useEffect(() => {
    setTimeout(() => {
      setIsOpen(true);
    }, 10);
  }, []);

  return (
    <div
      onMouseDown={handleClose}
      className={`fixed inset-0 flex items-center justify-center z-50 transition duration-200 ${
        isClosing || !isOpen
          ? "bg-black/0 backdrop-blur-0"
          : "bg-black/40 backdrop-blur-sm"
      }`}
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        className={`bg-white rounded-2xl w-[90%] max-w-md p-6 relative shadow-lg transform transition duration-200 ${
          isClosing || !isOpen
            ? "opacity-0 scale-95 translate-y-2"
            : "opacity-100 scale-100 translate-y-0"
        }`}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black transition duration-200 cursor-pointer"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-semibold mb-4 text-center">
          Crear tu negocio
        </h2>
        {backendError && (
          <p className="text-red-600 font-semibold text-center mb-2">
            {backendError}
          </p>
        )}
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
              <option value="">Seleccionar plan</option>
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
      </div>
    </div>
  );
}
