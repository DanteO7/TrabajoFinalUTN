import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTenantSchema } from "../../schema/tenant-schema";
import { useMutation, useQuery } from "@tanstack/react-query";
import { requestTenant } from "../../services/tenant";
import { getTenantPlans } from "../../services/tenant-plan";
import ErrorModal from "../modals/error-modal";
import Modal from "../modals/modal";
import FormInput from "../inputs/form-input";
import BlackButton from "../buttons/black-button";
import { getTurnoFacilPaymentData } from "../../services/payment";
import { Copy } from "lucide-react";
import { Check } from "lucide-react";
import ApprovalModal from "../modals/approval-modal";
import { Upload } from "lucide-react";

export default function TenantForm({ close, selectedPlan, setSelectedPlan }) {
  const { data: plans, isLoading } = useQuery({
    queryKey: ["tenantsPlan"],
    queryFn: getTenantPlans,
  });

  const { data: turnoFacilPaymentData } = useQuery({
    queryKey: ["turnoFacilPaymentData"],
    queryFn: getTurnoFacilPaymentData,
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

  const [copied, setCopied] = useState(false);
  const [comprobante, setComprobante] = useState(null);

  const copyPaymentData = async (value) => {
    try {
      await navigator.clipboard.writeText(value);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("No se pudo copiar:", error);
    }
  };

  const [backendError, setBackendError] = useState();
  const [errorModal, setErrorModal] = useState(false);
  const [succesMessage, setSuccessMessage] = useState();
  const [succesModal, setSuccesModal] = useState(false);

  const mutation = useMutation({
    mutationKey: ["requestTenant"],
    mutationFn: requestTenant,
    onSuccess: () => {
      setSuccessMessage(
        "Ya recibimos tu formulario y revisaremos el comprobante de pago. Te avisaremos por email cuando tu negocio esté creado o si detectamos algún error con el pago.",
      );

      setSuccesModal(true);
      setBackendError(null);
    },

    onError: (error) => {
      const data = error?.response?.data;

      let msg = "Ocurrió un error al enviar la solicitud.";

      if (typeof data === "string") {
        msg = data;
      } else if (data?.errors) {
        msg = Object.values(data.errors).flat().join(" - ");
      } else if (data?.title) {
        msg = data.title;
      }

      setBackendError(msg);
      setErrorModal(true);
    },
  });

  const selectedPlanId = Number(watch("tenantPlanId"));
  const currentPlan = plans.find((p) => p.id === selectedPlanId);

  const onSubmit = (data) => {
    if (!comprobante) {
      setBackendError("Tenés que adjuntar el comprobante de pago.");
      setErrorModal(true);
      return;
    }

    const formData = new FormData();

    formData.append("name", data.name);
    formData.append("tenantPlanId", data.tenantPlanId);
    formData.append("comprobante", comprobante);

    mutation.mutate(formData);
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
        <div className="bg-[#f4f0f5] rounded-lg border border-gray-400 shadow-md p-4">
          <p className="text-sm text-gray-600 mb-2">Alias</p>

          <div className="flex items-center justify-between gap-3">
            <p className="font-semibold text-[#333] break-all">
              {turnoFacilPaymentData?.alias}
            </p>

            <BlackButton
              type="button"
              text={copied ? "Copiado" : "Copiar"}
              textSmall={true}
              wfit
              img={copied ? <Check size={16} /> : <Copy size={16} />}
              onClick={() => copyPaymentData(turnoFacilPaymentData?.alias)}
              className="flex items-center gap-2 shrink-0 px-3 py-2 rounded-lg text-sm text-gray-600 hover:text-black hover:bg-white transition cursor-pointer"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Comprobante de pago
          </label>

          <input
            id="comprobante"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => {
              setComprobante(e.target.files?.[0] || null);
            }}
            className="sr-only"
          />

          <label
            htmlFor="comprobante"
            className="flex items-center justify-center gap-2 w-full rounded-lg px-3 py-3
            bg-[#f1eef3] border border-gray-400 text-gray-700
            hover:bg-[#e9e4ec] hover:border-gray-500
            transition-all duration-200 cursor-pointer"
          >
            <Upload size={18} />
            <span className="font-medium">
              {comprobante ? "Cambiar archivo" : "Seleccionar comprobante"}
            </span>
          </label>

          <p className="text-xs text-gray-500 mt-1">
            Formatos permitidos: PDF, JPG o PNG. Máximo 5 MB.
          </p>

          {comprobante && (
            <div className="flex items-center gap-2 mt-2 rounded-lg border border-gray-400 bg-[#F4F0F5] px-3 py-2">
              <span className="text-sm text-gray-700 truncate flex-1">
                {comprobante.name}
              </span>

              <button
                type="button"
                onClick={() => {
                  setComprobante(null);
                  document.getElementById("comprobante").value = "";
                }}
                className="text-gray-500 hover:text-gray-700 cursor-pointer transition-colors"
                aria-label="Eliminar comprobante"
              >
                <X size={18} />
              </button>
            </div>
          )}
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
        <ApprovalModal
          close={() => setSuccesModal(false)}
          message={succesMessage}
          isSuccesOrError={true}
        />
      )}
    </Modal>
  );
}
