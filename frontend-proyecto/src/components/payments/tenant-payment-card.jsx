import { SiMercadopago } from "react-icons/si";

import BlackButton from "../buttons/black-button";
import { getLocale } from "../../utils/formatting";
import { useTranslation } from "react-i18next";

const roleConfig = {
  Owner: {
    key: "roleOwner",
    className: "bg-purple-300 text-purple-600",
  },
  Professor: {
    key: "roleProfessor",
    className: "bg-blue-300 text-blue-600",
  },
  Student: {
    key: "roleStudent",
    className: "bg-orange-200 text-yellow-600",
  },
};

export default function TenantPaymentCard({
  tenant,
  turnoFacilPaymentData,
  mercadoPagoMutation,
  openTransferModal,
}) {
  const { t } = useTranslation();
  const status = tenant.monthlyFeeStatus?.toLowerCase();

  const isPaid = status === "paid";
  const isOverdue = status === "overdue";

  const role = roleConfig[tenant.role];

  const formatDate = (date) => {
    if (!date) {
      return t("tenantPaymentCard.noDate");
    }

    return new Date(date).toLocaleDateString(getLocale(), {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const paymentData =
    tenant.role === "Student"
      ? {
          alias: tenant.alias,
          cbu: tenant.cbu,
        }
      : turnoFacilPaymentData;

  return (
    <div className="rounded-lg border border-gray-400 p-6 shadow-md bg-[#efecf0]">
      <div className="flex flex-col gap-5">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-semibold">{tenant.name}</h3>

            <p className="text-gray-500 mt-1">
              {isPaid
                ? t("tenantPaymentCard.feeUpToDate")
                : isOverdue
                  ? t("tenantPaymentCard.feeOverdue")
                  : t("tenantPaymentCard.feePending")}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            {tenant.isActive ? (
              <span className="flex items-center justify-center rounded-full px-2.25 py-px text-[13px] bg-[#a1f3be] text-green-600">
                {t("tenantPaymentCard.active")}
              </span>
            ) : (
              <span className="flex items-center justify-center rounded-full px-2.25 py-px text-[13px] bg-red-300 text-red-600">
                {t("tenantPaymentCard.inactive")}
              </span>
            )}
            {role && (
              <span
                className={`flex items-center justify-center rounded-full px-2.25 py-px text-[13px] h-fit ${role.className}`}
              >
                {t(`tenantPaymentCard.${role.key}`)}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-px">
          <div className="flex justify-between">
            <span className="text-gray-500">
              {t("tenantPaymentCard.status")}
            </span>

            <span
              className={
                isPaid
                  ? "text-green-600 font-semibold"
                  : isOverdue
                    ? "text-red-600 font-semibold"
                    : "text-yellow-600 font-semibold"
              }
            >
              {isPaid
                ? t("tenantPaymentCard.paid")
                : isOverdue
                  ? t("tenantPaymentCard.overdue")
                  : t("tenantPaymentCard.pending")}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">
              {t("tenantPaymentCard.dueDate")}
            </span>

            <span className="font-medium">
              {formatDate(tenant.paymentDueDate)}
            </span>
          </div>
        </div>

        {!isPaid && (
          <div className="flex flex-col gap-3">
            {tenant.mercadoPagoConnected && tenant.role !== "Owner" && (
              <BlackButton
                text={
                  mercadoPagoMutation.isPending
                    ? t("tenantPaymentCard.generating")
                    : t("tenantPaymentCard.payMercadoPago")
                }
                img={<SiMercadopago size={20} />}
                textSmall={true}
                wfit={true}
                disabled={mercadoPagoMutation.isPending}
                onClick={() => mercadoPagoMutation.mutate(tenant.id)}
              />
            )}

            {(paymentData?.alias || paymentData?.cbu) && (
              <BlackButton
                text={t("tenantPaymentCard.transferDetails")}
                textSmall={true}
                wfit={true}
                onClick={() => openTransferModal(tenant)}
              />
            )}

            {!paymentData?.alias && !paymentData?.cbu && (
              <p className="text-gray-500 text-sm">
                {t("tenantPaymentCard.noTransferData")}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
