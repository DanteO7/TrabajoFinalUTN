import { useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import MainLayout from "../layouts/main-layout";
import {
  createTenantFromToken,
  getTenantDataFromToken,
  sendTenantCreatedEmail,
} from "../services/tenant";
import { getTenantPlans } from "../services/tenant-plan";
import { createTenantSchema } from "../schema/tenant-schema";
import BlackButton from "../components/buttons/black-button";
import Loading from "../components/loading";
import FormInput from "../components/inputs/form-input";
import SendEmailUserModal from "../components/modals/send-email-user-modal";
import { useState } from "react";

const describeValue = (value) => ({
  type: value === null ? "null" : typeof value,
  present: value !== undefined && value !== null && value !== "",
});

const compareValue = (value, expected) => ({
  ...describeValue(value),
  matchesExpected: value === expected,
});

const inspectForm = (values, expectedName, expectedTenantPlanId) => {
  const form = document.querySelector("#create-tenant-form");
  const nameInput = form?.querySelector('input[name="name"]');
  const planSelect = form?.querySelector('select[name="tenantPlanId"]');

  return {
    internal: {
      name: compareValue(values.name, expectedName),
      tenantPlanId: compareValue(values.tenantPlanId, expectedTenantPlanId),
    },
    inputs: {
      name: {
        mounted: Boolean(nameInput),
        matchesInternal: nameInput?.value === values.name,
        matchesExpected: nameInput?.value === expectedName,
      },
      tenantPlanId: {
        mounted: Boolean(planSelect),
        matchesInternal: planSelect?.value === values.tenantPlanId,
        matchesExpected: planSelect?.value === expectedTenantPlanId,
        optionCount: planSelect?.options.length ?? 0,
      },
    },
  };
};

export default function CreateTenant() {
  const [, setLocation] = useLocation();

  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  const [showEmailModal, setShowEmailModal] = useState(false);
  const [createdTenantId, setCreatedTenantId] = useState(null);
  const [emailError, setEmailError] = useState("");

  const emailMutation = useMutation({
    mutationFn: () => sendTenantCreatedEmail(createdTenantId),
    onSuccess: () => {
      setShowEmailModal(false);
      setLocation("/tu-espacio");
    },
    onError: (error) => {
      const data = error?.response?.data;

      setEmailError(
        typeof data === "string"
          ? data
          : "No se pudo enviar el correo. El negocio ya está creado; podés volver a intentar.",
      );
    },
  });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["tenantDataFromToken", token],
    queryFn: () => getTenantDataFromToken(token),
    enabled: !!token,
  });

  useEffect(() => {
    if (data === undefined) return;

    const isObject = data !== null && typeof data === "object";
    console.info("[crear-negocio diagnóstico] respuesta", {
      type: data === null ? "null" : typeof data,
      keys: isObject ? Object.keys(data) : [],
      fields: {
        name: describeValue(isObject ? data.name : undefined),
        tenantPlanId: describeValue(
          isObject ? data.tenantPlanId : undefined,
        ),
        userName: describeValue(isObject ? data.userName : undefined),
        userEmail: describeValue(isObject ? data.userEmail : undefined),
      },
    });
  }, [data]);

  const { data: plans = [], isLoading: isLoadingPlans } = useQuery({
    queryKey: ["tenantsPlan"],
    queryFn: getTenantPlans,
  });

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    subscribe,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createTenantSchema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      tenantPlanId: "",
    },
  });

  useEffect(() => {
    if (data && !isLoading && !isLoadingPlans) {
      const resetValues = {
        name: data.name,
        tenantPlanId: String(data.tenantPlanId),
      };

      reset(resetValues);

      const valuesAfterReset = getValues();
      console.info("[crear-negocio diagnóstico] reset", {
        ...inspectForm(
          valuesAfterReset,
          resetValues.name,
          resetValues.tenantPlanId,
        ),
      });
    }
  }, [data, getValues, isLoading, isLoadingPlans, reset]);

  useEffect(() => {
    if (!data) return;

    const expectedName = data.name;
    const expectedTenantPlanId = String(data.tenantPlanId);

    return subscribe({
      name: ["name", "tenantPlanId"],
      formState: { values: true },
      callback: ({ values }) => {
        console.info("[crear-negocio diagnóstico] actualización del formulario", {
          ...inspectForm(values, expectedName, expectedTenantPlanId),
        });
      },
    });
  }, [data, subscribe]);

  useEffect(() => {
    if (!data) return;

    const expectedName = data.name;
    const expectedTenantPlanId = String(data.tenantPlanId);

    console.info("[crear-negocio diagnóstico] render del formulario", {
      ...inspectForm(getValues(), expectedName, expectedTenantPlanId),
    });
  }, [data, getValues, isLoadingPlans, plans.length]);

  const mutation = useMutation({
    mutationFn: (formData) => createTenantFromToken(token, formData),
    onSuccess: (createdTenant) => {
      setCreatedTenantId(createdTenant.id);
      setShowEmailModal(true);
    },
  });

  const onSubmit = (formData) => {
    mutation.mutate({
      name: formData.name.trim(),
      tenantPlanId: Number(formData.tenantPlanId),
    });
  };

  if (!token) {
    return (
      <MainLayout>
        <div className="p-6">
          <h1 className="text-xl font-semibold">Enlace inválido</h1>
          <p className="mt-2">No se encontró el token de creación.</p>
        </div>
      </MainLayout>
    );
  }

  if (isLoading || isLoadingPlans) {
    return (
      <MainLayout>
        <Loading />
      </MainLayout>
    );
  }

  if (isError) {
    return (
      <MainLayout>
        <div className="p-6">
          <h1 className="text-xl font-semibold">
            No se pudo cargar la solicitud
          </h1>
          <p className="mt-2">
            {error?.response?.data || "El enlace no es válido."}
          </p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mt-12 w-full max-w-2xl">
        <h1 className="text-4xl font-semibold text-center">Crear negocio</h1>

        <form
          id="create-tenant-form"
          onSubmit={handleSubmit(onSubmit)}
          className="mt-6 space-y-4 rounded-lg border p-6"
        >
          <div>
            <p className="block text-sm font-medium mb-1">Usuario</p>
            <div className="mt-1 rounded-lg border bg-[#F1EEF3] border-gray-400 p-3">
              <p className="font-medium">{data.userName}</p>
              <p className="text-sm text-gray-500">{data.userEmail}</p>
            </div>
          </div>

          <div>
            <FormInput
              label="Nombre del negocio"
              id="name"
              type="text"
              placeholder="Ej: Gym power..."
              register={register("name")}
              error={errors.name}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Plan</label>

            <select
              {...register("tenantPlanId")}
              className="rounded-lg w-full px-3 pt-1.75 pb-2 text-gray-600 cursor-pointer bg-[#f1eef3] border border-gray-400 outline-none focus:ring-[1.5px] focus:border-transparent transition-all duration-200"
            >
              <option value="">Seleccionar plan</option>

              {plans.map((plan) => (
                <option key={plan.id} value={String(plan.id)}>
                  {plan.name} - ${plan.price}
                </option>
              ))}
            </select>

            {errors.tenantPlanId && (
              <p className="text-red-500 text-sm mt-1">
                {errors.tenantPlanId.message}
              </p>
            )}
          </div>

          {mutation.isError && (
            <p className="text-sm text-red-500">
              {typeof mutation.error?.response?.data === "string"
                ? mutation.error.response.data
                : "No se pudo crear el negocio. Intentá nuevamente."}
            </p>
          )}

          <BlackButton
            type="submit"
            disabled={mutation.isPending}
            text={mutation.isPending ? "Creando..." : "Crear negocio"}
            textSmall
          />
        </form>
      </div>
      {showEmailModal && (
        <SendEmailUserModal
          close={() => setShowEmailModal(false)}
          onConfirm={() => emailMutation.mutate()}
          isPending={emailMutation.isPending}
          error={emailError}
          isSuccesOrError
        />
      )}
    </MainLayout>
  );
}
