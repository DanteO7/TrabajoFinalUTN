import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import BlackButton from "../buttons/black-button";
import WhiteButton from "../buttons/white-button";
import { createPayment } from "../../services/payment";
import Modal from "../modals/modal";
import ErrorModal from "../modals/error-modal";
import SuccessModal from "../modals/success-modal";
import SelectStudentPaymentModal from "./select-student-payment-modal";
import { X } from "lucide-react";
import { createPaymentSchema } from "../../schema/payment-schema";

export default function PaymentForm({ tenantId, close, isAdmin = false }) {
  const queryClient = useQueryClient();

  const [selected, setSelected] = useState(null);

  const [selectModal, setSelectModal] = useState(false);

  const [backendError, setBackendError] = useState();

  const [errorModal, setErrorModal] = useState(false);

  const [successMessage, setSuccessMessage] = useState();

  const [successModal, setSuccessModal] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createPaymentSchema),
    defaultValues: {
      paymentMethod: "",
    },
  });

  const mutation = useMutation({
    mutationFn: createPayment,

    onSuccess: () => {
      if (!isAdmin) {
        queryClient.invalidateQueries({
          queryKey: ["tenantPayments", tenantId],
        });

        queryClient.invalidateQueries({
          queryKey: ["getStudents", tenantId],
        });
      }

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
    if (!selected) return;

    if (isAdmin) {
      mutation.mutate({
        userId: selected.ownerUserId,
        planId: selected.tenantPlanId,
        planType: "Tenant",
        tenantId: selected.id,
        paymentMethod: data.paymentMethod,
      });

      return;
    }

    mutation.mutate({
      userId: selected.userId,
      planId: selected.studentPlanId,
      planType: "Student",
      tenantId: selected.tenantId,
      paymentMethod: data.paymentMethod,
    });
  };

  const getSelectedName = () => {
    if (!selected) return "";

    if (isAdmin) {
      return selected.name;
    }

    if (!selected.user) {
      return `Alumno #${selected.id}`;
    }

    return `${selected.user.name} ${selected.user.surname}`;
  };

  return (
    <Modal open={true} onClose={close}>
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
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            {isAdmin ? "Negocio" : "Alumno"}
          </label>

          {!selected ? (
            <BlackButton
              type="button"
              text={isAdmin ? "Seleccionar negocio" : "Seleccionar alumno"}
              textSmall={true}
              onClick={() => setSelectModal(true)}
              wfit={true}
            />
          ) : (
            <div className="rounded-[13px] p-4 w-full border-gray-300 border-[1.7px] bg-[#efefef]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-medium tracking-wide text-gray-500">
                    {isAdmin ? "NEGOCIO SELECCIONADO" : "ALUMNO SELECCIONADO"}
                  </p>

                  <p className="mt-1 font-medium text-gray-900">
                    {getSelectedName()}
                  </p>

                  {!isAdmin && selected.user?.email ? (
                    <p className="mt-1 text-sm text-gray-600">
                      {selected.user.email}
                    </p>
                  ) : (
                    <p className="mt-1 text-sm text-gray-600">
                      {selected.ownerUser.name} {selected.ownerUser.surname}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="shrink-0 text-gray-500 hover:text-black cursor-pointer transition"
                  title="Quitar selección"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          )}

          {errors.selectedId && (
            <p className="mt-1 text-sm text-red-500">
              {errors.selectedId.message}
            </p>
          )}
        </div>

        {!isAdmin && selected && (
          <div className="rounded-[13px] p-4 w-full border-gray-300 border-[1.7px] bg-[#efefef] text-[15px]">
            <p className="text-xs font-medium tracking-wide text-gray-500">
              PLAN ACTUAL
            </p>

            <p className="mt-1 font-medium text-gray-900">
              {selected.studentPlan?.name || "Plan sin nombre"}
            </p>

            {selected.studentPlan?.price != null && (
              <p className="mt-1 text-sm text-gray-600">
                ${selected.studentPlan.price}
              </p>
            )}
          </div>
        )}

        {isAdmin && selected && (
          <div className="rounded-[13px] p-4 w-full border-gray-300 border-[1.7px] bg-[#efefef] text-[15px]">
            <p className="text-xs font-medium tracking-wide text-gray-500">
              PLAN ACTUAL
            </p>

            <p className="mt-1 font-medium text-gray-900">
              {selected.tenantPlan?.name || "Plan sin nombre"}
            </p>

            {selected.tenantPlan?.price != null && (
              <p className="mt-1 text-sm text-gray-600">
                ${selected.tenantPlan.price}
              </p>
            )}
          </div>
        )}

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

            <option value="Bank Transfer">Transferencia</option>

            <option value="Debit Card">Tarjeta de débito</option>
          </select>

          {errors.paymentMethod && (
            <p className="mt-1 text-sm text-red-500">
              {errors.paymentMethod.message}
            </p>
          )}
        </div>

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
            disabled={mutation.isPending || !selected}
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

      {selectModal && (
        <SelectStudentPaymentModal
          tenantId={tenantId}
          isAdmin={isAdmin}
          close={() => setSelectModal(false)}
          onSelect={(item) => {
            setSelected(item);
            setSelectModal(false);
          }}
        />
      )}
    </Modal>
  );
}
