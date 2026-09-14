import React, { useState } from "react";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import BlackButton from "../buttons/black-button";
import WhiteButton from "../buttons/white-button";

import { createPayment } from "../../services/payment";
import { GetPendingPaymentStudents } from "../../services/student";
import { getTenants } from "../../services/tenant";

import Modal from "../modals/modal";
import ErrorModal from "../modals/error-modal";
import SuccessModal from "../modals/success-modal";

import { X } from "lucide-react";

import { createPaymentSchema } from "../../schema/payment-schema";

export default function PaymentForm({ tenantId, close, isAdmin = false }) {
  const queryClient = useQueryClient();

  const [backendError, setBackendError] = useState();
  const [errorModal, setErrorModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState();
  const [successModal, setSuccessModal] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createPaymentSchema),
    defaultValues: {
      selectedId: "",
      paymentMethod: "",
    },
  });
  const {
    data: students = [],
    isLoading: isLoadingStudents,
    isError: isErrorStudents,
  } = useQuery({
    queryKey: ["getStudents", tenantId],
    queryFn: () => GetPendingPaymentStudents(tenantId),
    enabled: !isAdmin,
  });

  const {
    data: tenants = [],
    isLoading: isLoadingTenants,
    isError: isErrorTenants,
  } = useQuery({
    queryKey: ["getTenants"],
    queryFn: getTenants,
    enabled: isAdmin,
  });

  const selectedId = watch("selectedId");

  const selectedStudent = !isAdmin
    ? students.find((student) => String(student.id) === selectedId)
    : null;

  const selectedTenant = isAdmin
    ? tenants.find((tenant) => String(tenant.id) === selectedId)
    : null;

  const mutation = useMutation({
    mutationFn: createPayment,

    onSuccess: () => {
      /*
       * Si el pago es de un alumno:
       * actualizamos los pagos del negocio.
       */
      if (!isAdmin) {
        queryClient.invalidateQueries({
          queryKey: ["tenantPayments", tenantId],
        });

        queryClient.invalidateQueries({
          queryKey: ["getStudents", tenantId],
        });
      }

      /*
       * Si el pago es de un negocio:
       * actualizamos la lista de pagos del administrador.
       */
      if (isAdmin) {
        queryClient.invalidateQueries({
          queryKey: ["getTenantPaymentsForAdmin"],
        });

        queryClient.invalidateQueries({
          queryKey: ["getTenants"],
        });
      }

      setSuccessMessage("Pago registrado correctamente");
      setSuccessModal(true);

      setTimeout(() => {
        close();
      }, 2000);
    },

    onError: (error) => {
      const data = error?.response?.data;

      let msg = "Ocurrió un error al registrar el pago";

      if (typeof data === "string") {
        msg = data;
      } else if (data?.errors) {
        msg = Object.values(data.errors).flat().join(" - ");
      } else if (data?.message) {
        msg = data.message;
      }

      setBackendError(msg);
      setErrorModal(true);
    },
  });

  const onSubmit = (data) => {
    /*
     * ADMIN
     * Negocio -> TurnoFácil
     */
    if (isAdmin) {
      const tenant = tenants.find(
        (tenant) => String(tenant.id) === data.selectedId,
      );

      if (!tenant) return;

      mutation.mutate({
        userId: tenant.ownerUserId,
        planId: tenant.tenantPlanId,
        planType: "Tenant",
        tenantId: tenant.id,
        paymentMethod: data.paymentMethod,
      });

      return;
    }

    /*
     * TENANT
     * Alumno -> Negocio
     */
    const student = students.find(
      (student) => String(student.id) === data.selectedId,
    );

    if (!student) return;

    mutation.mutate({
      userId: student.userId,
      planId: student.studentPlanId,
      planType: "Student",
      tenantId: student.tenantId,
      paymentMethod: data.paymentMethod,
    });
  };

  const getStudentName = (student) => {
    if (!student?.user) {
      return `Alumno #${student?.id}`;
    }

    return `${student.user.name} ${student.user.surname}`;
  };

  const isLoading = isAdmin ? isLoadingTenants : isLoadingStudents;

  const isError = isAdmin ? isErrorTenants : isErrorStudents;

  const hasSelected = isAdmin ? !!selectedTenant : !!selectedStudent;

  return (
    <Modal open onClose={close}>
      <div className="mb-6">
        <button
          onClick={close}
          className="absolute top-4 right-4 text-gray-500 hover:text-black transition duration-200 cursor-pointer"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold text-gray-900">Registrar pago</h2>

        <p className="mt-1 text-sm text-gray-500">
          {isAdmin
            ? "Registrá el pago mensual de un negocio."
            : "Registrá el pago mensual de un alumno."}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* ALUMNO / NEGOCIO */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            {isAdmin ? "Negocio" : "Alumno"}
          </label>

          <select
            {...register("selectedId")}
            className="rounded-[13px] px-3 py-2 w-full border-gray-300 border-[1.7px] bg-[#efefef] text-[15px] cursor-pointer"
          >
            <option value="">
              {isLoading
                ? "Cargando..."
                : isError
                  ? isAdmin
                    ? "Error al cargar los negocios"
                    : "Error al cargar los alumnos"
                  : isAdmin
                    ? tenants.length === 0
                      ? "No hay negocios"
                      : "Seleccionar negocio"
                    : students.length === 0
                      ? "No hay alumnos para pagar"
                      : "Seleccionar alumno"}
            </option>

            {isAdmin
              ? tenants.map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.name}
                  </option>
                ))
              : students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {getStudentName(student)}
                  </option>
                ))}
          </select>

          {errors.selectedId && (
            <p className="mt-1 text-sm text-red-500">
              {errors.selectedId.message}
            </p>
          )}
        </div>

        {/* INFORMACIÓN DEL PLAN DEL ALUMNO */}
        {!isAdmin && selectedStudent && (
          <div className="rounded-[13px] p-4 w-full border-gray-300 border-[1.7px] bg-[#efefef] text-[15px]">
            <p className="text-xs font-medium tracking-wide text-gray-500">
              PLAN ACTUAL
            </p>

            <p className="mt-1 font-medium text-gray-900">
              {selectedStudent.studentPlan?.name || "Plan sin nombre"}
            </p>

            {selectedStudent.studentPlan?.price != null && (
              <p className="mt-1 text-sm text-gray-600">
                ${selectedStudent.studentPlan.price}
              </p>
            )}
          </div>
        )}

        {/* INFORMACIÓN DEL PLAN DEL NEGOCIO */}
        {isAdmin && selectedTenant && (
          <div className="rounded-[13px] p-4 w-full border-gray-300 border-[1.7px] bg-[#efefef] text-[15px]">
            <p className="text-xs font-medium tracking-wide text-gray-500">
              PLAN ACTUAL
            </p>

            <p className="mt-1 font-medium text-gray-900">
              {selectedTenant.tenantPlan?.name || "Plan sin nombre"}
            </p>

            {selectedTenant.tenantPlan?.price != null && (
              <p className="mt-1 text-sm text-gray-600">
                ${selectedTenant.tenantPlan.price}
              </p>
            )}
          </div>
        )}

        {/* MÉTODO DE PAGO */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Método de pago
          </label>

          <select
            {...register("paymentMethod")}
            className="rounded-[13px] px-3 py-2 w-full border-gray-300 border-[1.7px] bg-[#efefef] text-[15px] cursor-pointer"
          >
            <option value="">Seleccionar método</option>

            <option value="Cash">Efectivo</option>

            <option value="Bank Transfer">Transferencia bancaria</option>

            <option value="Debit Card">Tarjeta de débito</option>
          </select>

          {errors.paymentMethod && (
            <p className="mt-1 text-sm text-red-500">
              {errors.paymentMethod.message}
            </p>
          )}
        </div>

        {/* BOTONES */}
        <div className="grid grid-cols-2 gap-3 mt-8">
          <WhiteButton
            text="Cancelar"
            textSmall={true}
            onClick={close}
            disabled={mutation.isPending}
          />

          <BlackButton
            type="submit"
            text={mutation.isPending ? "Registrando..." : "Registrar"}
            textSmall={true}
            disabled={mutation.isPending || !hasSelected}
          />
        </div>
      </form>

      {/* ERROR */}
      {errorModal && (
        <ErrorModal
          close={() => setErrorModal(false)}
          message={backendError}
          isSuccesOrError={true}
        />
      )}

      {/* ÉXITO */}
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
