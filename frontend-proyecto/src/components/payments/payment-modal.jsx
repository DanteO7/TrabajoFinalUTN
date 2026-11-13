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
import { useHasPermission } from "../../store/tenant-store";
import { formatCurrency, getLocale } from "../../utils/formatting";
import { useTranslation } from "react-i18next";

export default function PaymentModal({ payment, tenantId, close, isAdmin }) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);

  const [backendError, setBackendError] = useState();
  const [errorModal, setErrorModal] = useState(false);

  const [successMessage, setSuccessMessage] = useState();
  const [successModal, setSuccessModal] = useState(false);

  const [confirmModal, setConfirmModal] = useState(false);

  const queryClient = useQueryClient();

  const canUpdate = useHasPermission(tenantId, "PAYMENT_UPDATE");
  const canDelete = useHasPermission(tenantId, "PAYMENT_DELETE");

  const canUpdatePayment = isAdmin ? true : canUpdate;
  const canDeletePayment = isAdmin ? true : canDelete;

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      paymentMethod: payment.paymentMethod,
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deletePayment(payment.id),

    onSuccess: () => {
      setConfirmModal(false);
      setSuccessMessage(t("paymentModal.deleteSuccess"));
      setSuccessModal(true);

      setTimeout(() => {
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
        setSuccessModal(false);
        close();
      }, 2000);
    },

    onError: (error) => {
      setConfirmModal(false);

      const data = error?.response?.data;

      let msg = t("paymentModal.deleteError");

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

      setSuccessMessage(t("paymentModal.updateSuccess"));
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

      let msg = t("paymentModal.updateError");

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
    if (payment?.user) {
      return `${payment.user.name} ${payment.user.surname}`;
    }
    if (payment?.studentName || payment?.studentSurname) {
      return `${payment.studentName || ""} ${payment.studentSurname || ""}`.trim();
    }
    if (payment?.userId) {
      return t("paymentModal.userNumber", { id: payment.userId });
    }
    return "-";
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString(getLocale(), {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getPaymentMethodName = (method) => {
    switch (method) {
      case "Cash":
        return t("paymentModal.cash");

      case "Bank Transfer":
        return t("paymentModal.transfer");

      case "Debit Card":
        return t("paymentModal.debitCard");

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
        return t("tenantPaymentCard.paid");

      case "Pending":
        return t("tenantPaymentCard.pending");

      case "Rejected":
        return t("paymentModal.rejected");

      case "Cancelled":
        return t("paymentModal.cancelled");

      default:
        return status;
    }
  };

  const getPlanTypeLabel = () => {
    return payment.planType === "Student"
      ? t("paymentModal.student")
      : t("paymentModal.business");
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
          <h2 className="text-2xl font-semibold mb-5">
            {t("paymentModal.title")}
          </h2>

          <div className="space-y-4">
            <div className="bg-[#f4f0f5] rounded-lg border border-gray-300 shadow-md p-4">
              <p className="text-sm text-gray-600 mb-1">
                {getPlanTypeLabel()}
              </p>

              <p className="font-semibold text-[#333]">
                {payment.planType === "Student"
                  ? getUserName()
                  : payment.tenantName || `Negocio #${payment.tenantId}`}
              </p>
            </div>

            <div className="bg-[#f4f0f5] rounded-lg border border-gray-300 shadow-md p-4">
              <p className="text-sm text-gray-600 mb-1">
                {t("paymentModal.plan")}
              </p>

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

            <div className="bg-[#f4f0f5] rounded-lg border border-gray-300 shadow-md p-4">
              <p className="text-sm text-gray-600 mb-1">
                {t("paymentModal.method")}
              </p>

              <p className="font-semibold text-[#333]">
                {getPaymentMethodName(payment.paymentMethod)}
              </p>
            </div>

            <div className="bg-[#f4f0f5] rounded-lg border border-gray-300 shadow-md p-4">
              <p className="text-sm text-gray-600 mb-1">
                {t("paymentModal.date")}
              </p>

              <p className="font-semibold text-[#333]">
                {formatDate(payment.paymentDate)}
              </p>
            </div>

            <div className="bg-[#f4f0f5] rounded-lg border border-gray-300 shadow-md p-4">
              <p className="text-sm text-gray-600 mb-1">
                {t("paymentModal.amount")}
              </p>

              <p className="font-bold text-[#333] whitespace-nowrap">
                {formatCurrency(payment.amount)}
              </p>
            </div>

            <div className="bg-[#f4f0f5] rounded-lg border border-gray-300 shadow-md p-4">
              <p className="text-sm text-gray-600 mb-2">
                {t("paymentModal.status")}
              </p>

              <span
                className={`inline-block text-sm font-medium rounded-full px-3 py-1 ${getStatusColor(
                  payment.status,
                )}`}
              >
                {getStatusLabel(payment.status)}
              </span>
            </div>

            {payment.externalPaymentId && (
              <div className="bg-[#f4f0f5] rounded-lg border border-gray-300 shadow-md p-4">
                <p className="text-sm text-gray-600 mb-1">
                  {t("paymentModal.externalId")}
                </p>

                <p className="font-semibold text-[#333] break-all">
                  {payment.externalPaymentId}
                </p>
              </div>
            )}
          </div>
          {(canUpdatePayment || canDeletePayment) && (
            <div
              className={`grid ${canUpdatePayment && canDeletePayment ? "grid-cols-2" : "grid-cols-1"} gap-3 max-[360px]:text-[13px] mt-8`}
            >
              {canDeletePayment && (
                <RedButton
                  text={t("paymentModal.delete")}
                  img={<Trash2 size={18} />}
                  onClick={() => setConfirmModal(true)}
                  textSmall={true}
                  disabled={deleteMutation.isPending}
                />
              )}

              {canUpdatePayment && (
                <BlackButton
                  text={t("paymentModal.edit")}
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
          <h2 className="text-2xl font-semibold text-center">
            {t("paymentModal.editTitle")}
          </h2>

          <div className="bg-[#f4f0f5] rounded-lg border border-gray-300 shadow-md p-4">
            <p className="text-sm text-gray-600 mb-1">
              {t("paymentModal.payment")}
            </p>

            <p className="font-semibold text-[#333]">
              {payment.planType === "Student"
                ? getUserName()
                : payment.tenantName}
            </p>

            <p className="text-sm text-gray-600 mt-1">{payment.planName}</p>

            <p className="font-bold text-[#333] mt-2">
              {formatCurrency(payment.amount)}
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-3">
              {t("paymentModal.method")}
            </label>

            <select
              {...register("paymentMethod")}
              className="w-full rounded-lg px-3 h-11.5 py-2.5 text-gray-600 cursor-pointer bg-[#f4f0f5] shadow-md border border-gray-300 outline-none focus:ring-[1.5px] focus:border-transparent transition-[border-color,box-shadow] duration-200"
            >
              <option value="Cash">{t("paymentModal.cash")}</option>

              <option value="Bank Transfer">{t("paymentModal.transfer")}</option>

              <option value="Debit Card">{t("paymentModal.debitCard")}</option>

              <option value="Mercado Pago">Mercado Pago</option>
            </select>
          </div>

          <div className="flex justify-end gap-3">
            <WhiteButton
              text={t("paymentModal.cancel")}
              onClick={() => {
                reset({
                  paymentMethod: payment.paymentMethod,
                });

                setEditing(false);
              }}
              textSmall={true}
            />

            <BlackButton
              text={
                updateMutation.isPending
                  ? t("paymentModal.updating")
                  : t("paymentModal.update")
              }
              onClick={handleSubmit(onSubmit)}
              textSmall={true}
              disabled={updateMutation.isPending}
            />
          </div>
        </div>
      )}

      {confirmModal && (
        <ConfirmModal
          title={t("paymentModal.confirmTitle")}
          message={
            payment.planType === "Student"
              ? t("paymentModal.confirmStudent", { name: getUserName() })
              : t("paymentModal.confirmBusiness", {
                  name: payment.tenantName,
                })
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
