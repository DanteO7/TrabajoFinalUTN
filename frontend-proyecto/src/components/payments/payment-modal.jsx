import { X, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import Modal from "../modals/modal";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import SuccessModal from "../modals/success-modal";
import ErrorModal from "../modals/error-modal";
import ConfirmModal from "../modals/confirm-modal";
import RedButton from "../buttons/red-button";
import BlackButton from "../buttons/black-button";
import WhiteButton from "../buttons/white-button";
import { deletePayment, updatePayment } from "../../services/payment";
import { useTenantStore } from "../../store/tenant-store";

export default function PaymentModal({ payment, tenantId, close }) {
  const [editing, setEditing] = useState(false);

  const [backendError, setBackendError] = useState();
  const [errorModal, setErrorModal] = useState(false);

  const [successMessage, setSuccessMessage] = useState();
  const [successModal, setSuccessModal] = useState(false);

  const [confirmModal, setConfirmModal] = useState(false);

  const queryClient = useQueryClient();

  const hasPermission = useTenantStore((state) => state.hasPermission);

  const canUpdatePayment = hasPermission(tenantId, "PAYMENT_UPDATE");

  const canDeletePayment = hasPermission(tenantId, "PAYMENT_DELETE");

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      paymentMethod: payment.paymentMethod,
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deletePayment(payment.id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tenantPayments", tenantId],
      });

      queryClient.invalidateQueries({
        queryKey: ["myPayments"],
      });

      queryClient.invalidateQueries({
        queryKey: ["getTenantPaymentsForAdmin"],
      });

      queryClient.invalidateQueries({
        queryKey: ["getStudents", tenantId],
      });

      queryClient.invalidateQueries({
        queryKey: ["getTenants"],
      });

      setConfirmModal(false);

      setSuccessMessage("Pago eliminado correctamente");
      setSuccessModal(true);

      setTimeout(() => {
        close();
      }, 2000);
    },

    onError: (error) => {
      setConfirmModal(false);

      const data = error?.response?.data;

      let msg = "Ocurrió un error al eliminar el pago";

      if (typeof data === "string") {
        msg = data;
      } else if (data?.errors) {
        msg = Object.values(data.errors).flat().join(" - ");
      } else if (data?.message) {
        msg = data.message;
      } else if (data?.title) {
        msg = data.title;
      }

      setBackendError(msg);
      setErrorModal(true);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => updatePayment(payment.id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tenantPayments", tenantId],
      });

      queryClient.invalidateQueries({
        queryKey: ["myPayments"],
      });

      queryClient.invalidateQueries({
        queryKey: ["getTenantPaymentsForAdmin"],
      });

      setSuccessMessage("Pago actualizado correctamente");
      setSuccessModal(true);

      setEditing(false);

      reset({
        paymentMethod: payment.paymentMethod,
      });

      setTimeout(() => {
        setSuccessModal(false);
      }, 2000);
    },

    onError: (error) => {
      const data = error?.response?.data;

      let msg = "Ocurrió un error al actualizar el pago";

      if (typeof data === "string") {
        msg = data;
      } else if (data?.errors) {
        msg = Object.values(data.errors).flat().join(" - ");
      } else if (data?.message) {
        msg = data.message;
      } else if (data?.title) {
        msg = data.title;
      }

      setBackendError(msg);
      setErrorModal(true);
    },
  });

  const onSubmit = (form) => {
    updateMutation.mutate({
      paymentMethod: form.paymentMethod,
    });
  };

  const getUserName = () => {
    if (!payment?.user) {
      return `Usuario #${payment?.userId}`;
    }

    return `${payment.user.name} ${payment.user.surname}`;
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getPaymentMethodName = (method) => {
    switch (method) {
      case "Cash":
        return "Efectivo";

      case "Bank Transfer":
        return "Transferencia bancaria";

      case "Debit Card":
        return "Tarjeta de débito";

      case "Mercado Pago":
        return "Mercado Pago";

      default:
        return method || "-";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-700";

      case "Pending":
        return "bg-yellow-100 text-yellow-700";

      case "Rejected":
      case "Cancelled":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "Paid":
        return "Pagado";

      case "Pending":
        return "Pendiente";

      case "Rejected":
        return "Rechazado";

      case "Cancelled":
        return "Cancelado";

      default:
        return status;
    }
  };

  const getPlanTypeLabel = () => {
    return payment.planType === "Student" ? "Alumno" : "Negocio";
  };

  return (
    <Modal open onClose={close}>
      <button
        onClick={close}
        className="absolute top-4 right-4 text-gray-500 hover:text-black transition duration-200 cursor-pointer"
      >
        <X size={20} />
      </button>

      {!editing ? (
        <>
          <h2 className="text-2xl font-semibold mb-5">Detalle del pago</h2>

          <div className="space-y-4 mb-8">
            <div className="bg-[#efefef] rounded-xl p-4">
              <p className="text-sm text-gray-600 mb-1">
                {payment.planType === "Student" ? "Alumno" : "Negocio"}
              </p>

              <p className="font-semibold text-[#333]">
                {payment.planType === "Student"
                  ? getUserName()
                  : payment.tenantName || `Negocio #${payment.tenantId}`}
              </p>
            </div>

            <div className="bg-[#efefef] rounded-xl p-4">
              <p className="text-sm text-gray-600 mb-1">Plan</p>

              <div className="flex justify-between items-start gap-4">
                <div>
                  <p className="font-semibold text-[#333]">
                    {payment.planName || `Plan #${payment.planId}`}
                  </p>

                  <p className="text-sm text-gray-600 mt-1">
                    {getPlanTypeLabel()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#efefef] rounded-xl p-4">
              <p className="text-sm text-gray-600 mb-1">Método de pago</p>

              <p className="font-semibold text-[#333]">
                {getPaymentMethodName(payment.paymentMethod)}
              </p>
            </div>

            <div className="bg-[#efefef] rounded-xl p-4">
              <p className="text-sm text-gray-600 mb-1">Fecha</p>

              <p className="font-semibold text-[#333]">
                {formatDate(payment.paymentDate)}
              </p>
            </div>

            <div className="bg-[#efefef] rounded-xl p-4">
              <p className="text-sm text-gray-600 mb-1">Monto</p>

              <p className="font-bold text-[#333] whitespace-nowrap">
                ${payment.amount?.toLocaleString("es-AR")}
              </p>
            </div>

            <div className="bg-[#efefef] rounded-xl p-4">
              <p className="text-sm text-gray-600 mb-2">Estado de pago</p>

              <span
                className={`inline-block text-sm font-medium rounded-full px-3 py-1 ${getStatusColor(
                  payment.status,
                )}`}
              >
                {getStatusLabel(payment.status)}
              </span>
            </div>

            {payment.externalPaymentId && (
              <div className="bg-[#efefef] rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-1">ID de Mercado Pago</p>

                <p className="font-semibold text-[#333] break-all">
                  {payment.externalPaymentId}
                </p>
              </div>
            )}
          </div>

          {(canUpdatePayment || canDeletePayment) && (
            <div className="grid grid-cols-2 gap-3 max-[360px]:text-[13px]">
              {canDeletePayment && (
                <RedButton
                  text="Eliminar"
                  img={<Trash2 size={18} />}
                  onClick={() => setConfirmModal(true)}
                  textSmall={true}
                  disabled={deleteMutation.isPending}
                />
              )}

              {canUpdatePayment && (
                <BlackButton
                  text="Editar"
                  img={<Pencil size={18} />}
                  onClick={() => setEditing(true)}
                  textSmall={true}
                />
              )}
            </div>
          )}
        </>
      ) : (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-center">Editar pago</h2>

          <div className="bg-[#efefef] rounded-xl p-4">
            <p className="text-sm text-gray-600 mb-1">Pago</p>

            <p className="font-semibold text-[#333]">
              {payment.planType === "Student"
                ? getUserName()
                : payment.tenantName}
            </p>

            <p className="text-sm text-gray-600 mt-1">{payment.planName}</p>

            <p className="font-bold text-[#333] mt-2">
              ${payment.amount?.toLocaleString("es-AR")}
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-3">
              Método de pago
            </label>

            <select
              {...register("paymentMethod")}
              className="w-full border rounded-xl px-3 py-2 bg-[#efefef] focus:outline-none focus:ring-2 focus:ring-[#333]"
            >
              <option value="Cash">Efectivo</option>

              <option value="Bank Transfer">Transferencia bancaria</option>

              <option value="Debit Card">Tarjeta de débito</option>

              <option value="Mercado Pago">Mercado Pago</option>
            </select>
          </div>

          <div className="flex justify-end gap-3">
            <WhiteButton
              text="Cancelar"
              onClick={() => {
                reset({
                  paymentMethod: payment.paymentMethod,
                });

                setEditing(false);
              }}
              textSmall={true}
            />

            <BlackButton
              text={updateMutation.isPending ? "Actualizando..." : "Actualizar"}
              onClick={handleSubmit(onSubmit)}
              textSmall={true}
              disabled={updateMutation.isPending}
            />
          </div>
        </div>
      )}

      {confirmModal && (
        <ConfirmModal
          title="¿Eliminar este pago?"
          message={
            payment.planType === "Student"
              ? `Estás por eliminar el pago de "${getUserName()}". Esta acción no se puede deshacer.`
              : `Estás por eliminar el pago del negocio "${payment.tenantName}". Esta acción no se puede deshacer.`
          }
          onConfirm={() => deleteMutation.mutate()}
          close={() => setConfirmModal(false)}
          isPending={deleteMutation.isPending}
        />
      )}

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
