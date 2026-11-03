import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";

import BlackButton from "../buttons/black-button";
import RedButton from "../buttons/red-button";
import ConfirmModal from "../modals/confirm-modal";
import ErrorModal from "../modals/error-modal";
import Modal from "../modals/modal";
import SuccessModal from "../modals/success-modal";
import {
  activateTenant,
  deactivateTenant,
  deleteTenant,
} from "../../services/tenant";
import { useAuthStore } from "../../store/auth-store";

const dueDateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "UTC",
});

function DetailField({ label, value }) {
  return (
    <div className="min-w-0 rounded-lg border border-gray-400 bg-[#f4f0f5] p-4 shadow-md">
      <p className="mb-1 text-sm text-gray-600">{label}</p>
      <p className="break-words font-semibold text-[#333]">{value}</p>
    </div>
  );
}

function formatDueDate(value, notProvidedText) {
  if (typeof value !== "string" || !value.trim()) {
    return notProvidedText;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return notProvidedText;
  }

  return dueDateFormatter.format(date);
}

export default function TenantModal({ tenant, onTenantUpdated, close }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const isAdmin = useAuthStore((state) => state.user?.roles?.includes("Admin"));
  const [confirmAction, setConfirmAction] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [showError, setShowError] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!showSuccess) return undefined;

    const timeoutId = setTimeout(close, 2000);
    return () => clearTimeout(timeoutId);
  }, [close, showSuccess]);

  const mutation = useMutation({
    mutationFn: (action) => {
      if (action === "delete") return deleteTenant(tenant.id);
      if (action === "activate") return activateTenant(tenant.id);
      return deactivateTenant(tenant.id);
    },
    onSuccess: async (_result, action) => {
      setConfirmAction(null);

      if (action === "delete") {
        await queryClient.invalidateQueries({ queryKey: ["tenants"] });
        setSuccessMessage(t("tenants.deleteSuccess"));
      } else {
        const isActive = action === "activate";
        const updatedTenant = { ...tenant, isActive };
        queryClient.setQueryData(["tenants"], (current = []) =>
          current.map((item) => (item.id === tenant.id ? updatedTenant : item)),
        );
        onTenantUpdated(updatedTenant);
        await queryClient.invalidateQueries({ queryKey: ["tenants"] });
        setSuccessMessage(
          t(isActive ? "tenants.activateSuccess" : "tenants.deactivateSuccess"),
        );
      }

      setShowSuccess(true);
    },
    onError: (error, action) => {
      setConfirmAction(null);

      const data = error?.response?.data;
      const message =
        typeof data === "string"
          ? data
          : data?.message ||
            data?.title ||
            t(
              action === "delete"
                ? "tenants.deleteError"
                : action === "activate"
                  ? "tenants.activateError"
                  : "tenants.deactivateError",
            );

      setErrorMessage(message);
      setShowError(true);
    },
  });

  const fieldValue = (value) => {
    if (value === null || value === undefined || value === "") {
      return t("tenants.notProvided");
    }
    if (typeof value === "boolean") {
      return value ? t("tenants.yes") : t("tenants.no");
    }
    if (typeof value === "object") {
      if (Object.keys(value).length === 0) {
        return t("tenants.notProvided");
      }
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  const activeStatus = (value) => {
    if (typeof value !== "boolean") {
      return t("tenants.notProvided");
    }

    return t(value ? "tenants.active" : "tenants.inactive");
  };

  const monthlyFeeStatus = (value) => {
    if (typeof value !== "string") {
      return t("tenants.notProvided");
    }

    const statusKey = {
      pending: "pending",
      paid: "paid",
      overdue: "overdue",
    }[value.trim().toLowerCase()];

    return statusKey
      ? t(`tenants.monthlyFeeStatuses.${statusKey}`)
      : t("tenants.notProvided");
  };

  if (confirmAction) {
    const action = confirmAction;
    const actionKeys = {
      activate: "activate",
      deactivate: "deactivate",
      delete: "delete",
    };
    const actionKey = actionKeys[action];

    return (
      <>
        <ConfirmModal
          title={t(`tenants.${actionKey}Title`)}
          message={t(`tenants.${actionKey}Confirmation`)}
          confirmText={t(`tenants.${actionKey}Action`)}
          cancelText={t("tenants.cancel")}
          onConfirm={() => mutation.mutate(action)}
          close={() => setConfirmAction(null)}
          isPending={mutation.isPending}
          pendingText={t(`tenants.${actionKey}Pending`)}
        />
        {showError && (
          <ErrorModal
            close={() => setShowError(false)}
            message={errorMessage}
            isSuccesOrError
          />
        )}
      </>
    );
  }

  if (showSuccess) {
    return (
      <SuccessModal
        close={() => {
          setShowSuccess(false);
          close();
        }}
        message={successMessage}
        isSuccesOrError
      />
    );
  }

  if (showError) {
    return (
      <ErrorModal
        close={() => setShowError(false)}
        message={errorMessage}
        isSuccesOrError
      />
    );
  }

  return (
    <Modal open onClose={close}>
      <button
        type="button"
        onClick={close}
        aria-label={t("tenants.close")}
        className="absolute top-4 right-4 cursor-pointer text-gray-500 transition hover:text-black"
      >
        <X size={20} />
      </button>

      <h2 className="mb-2 text-2xl font-semibold">{tenant.name}</h2>
      <p className="mb-6 text-sm text-gray-600">
        {t("tenants.id")}: {tenant.id}
      </p>

      <section className="mb-6">
        <h3 className="mb-3 text-lg font-semibold">
          {t("tenants.businessDetails")}
        </h3>
        <div className="grid gap-3 min-[700px]:grid-cols-2">
          <DetailField
            label={t("tenants.name")}
            value={fieldValue(tenant.name)}
          />
          <DetailField
            label={t("tenants.address")}
            value={fieldValue(tenant.address)}
          />
          <DetailField
            label={t("tenants.activeStatus")}
            value={activeStatus(tenant.isActive)}
          />
          <DetailField
            label={t("tenants.monthlyFeeStatus")}
            value={monthlyFeeStatus(tenant.monthlyFeeStatus)}
          />
          <DetailField
            label={t("tenants.alias")}
            value={fieldValue(tenant.alias)}
          />
          <DetailField
            label={t("tenants.cbu")}
            value={fieldValue(tenant.cbu)}
          />
          <DetailField
            label={t("tenants.paymentDueDate")}
            value={formatDueDate(
              tenant.paymentDueDate,
              t("tenants.notProvided"),
            )}
          />
          <div className="min-[700px]:col-span-2">
            <DetailField
              label={t("tenants.socialNetworks")}
              value={fieldValue(tenant.socialNetworks)}
            />
          </div>
        </div>
      </section>

      <section className="mb-6">
        <h3 className="mb-3 text-lg font-semibold">
          {t("tenants.ownerDetails")}
        </h3>
        <div className="grid gap-3 min-[700px]:grid-cols-2">
          <DetailField
            label={t("tenants.ownerName")}
            value={fieldValue(tenant.ownerUser?.name)}
          />
          <DetailField
            label={t("tenants.ownerSurname")}
            value={fieldValue(tenant.ownerUser?.surname)}
          />
          <DetailField
            label={t("tenants.ownerEmail")}
            value={fieldValue(tenant.ownerUser?.email)}
          />
          <DetailField
            label={t("tenants.ownerPhone")}
            value={fieldValue(tenant.ownerUser?.phoneNumber)}
          />
          <DetailField
            label={t("tenants.ownerGoogleAccount")}
            value={fieldValue(tenant.ownerUser?.isGoogleAccount)}
          />
          <DetailField
            label={t("tenants.ownerActive")}
            value={activeStatus(tenant.ownerUser?.isActive)}
          />
        </div>
      </section>

      <section className="mb-8">
        <h3 className="mb-3 text-lg font-semibold">
          {t("tenants.planDetails")}
        </h3>
        <div className="grid gap-3 min-[700px]:grid-cols-2">
          <DetailField
            label={t("tenants.planName")}
            value={fieldValue(tenant.tenantPlan?.name)}
          />
          <DetailField
            label={t("tenants.planPrice")}
            value={fieldValue(tenant.tenantPlan?.price)}
          />
          <DetailField
            label={t("tenants.maxStudents")}
            value={fieldValue(tenant.tenantPlan?.maxStudents)}
          />
          <DetailField
            label={t("tenants.maxProfessors")}
            value={fieldValue(tenant.tenantPlan?.maxProfessors)}
          />
          <DetailField
            label={t("tenants.exercisesAndRoutines")}
            value={fieldValue(tenant.tenantPlan?.includesExercisesAndRoutines)}
          />
        </div>
      </section>

      {isAdmin && (
        <div className="grid grid-cols-2 gap-3">
          <RedButton
            type="button"
            onClick={() => setConfirmAction("delete")}
            textSmall
            text={t("tenants.deleteAction")}
          />
          {tenant.isActive ? (
            <BlackButton
              type="button"
              onClick={() => setConfirmAction("deactivate")}
              textSmall
              text={t("tenants.deactivateAction")}
            />
          ) : (
            <BlackButton
              type="button"
              onClick={() => setConfirmAction("activate")}
              textSmall
              text={t("tenants.activateAction")}
            />
          )}
        </div>
      )}
    </Modal>
  );
}
