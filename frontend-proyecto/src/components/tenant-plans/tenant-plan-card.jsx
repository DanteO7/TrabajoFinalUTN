import { Trash2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ErrorModal from "../modals/error-modal";
import ConfirmModal from "../modals/confirm-modal";
import { useState } from "react";
import { deleteTenantPlan } from "../../services/tenant-plan";
import BlackButton from "../buttons/black-button";
import { Pencil } from "lucide-react";
import RedButton from "../buttons/red-button";
import { formatCurrency } from "../../utils/formatting";
import { useTranslation } from "react-i18next";

export default function TenantPlanCard({ plan, onEdit }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [backendError, setBackendError] = useState();
  const [errorModal, setErrorModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: () => deleteTenantPlan(plan.id),

    onSuccess: () => {
      setConfirmModal(false);

      queryClient.invalidateQueries({
        queryKey: ["getTenantPlans"],
      });
    },

    onError: (error) => {
      setConfirmModal(false);

      const data = error?.response?.data;

      let msg = t("planUi.deleteError");

      if (typeof data === "string") {
        msg = data;
      } else if (data?.message) {
        msg = data.message;
      }

      setBackendError(msg);
      setErrorModal(true);
    },
  });

  return (
    <>
      <div className="border border-gray-400 rounded-lg p-5 shadow-sm flex flex-col gap-4 bg-[#efecf0]">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-semibold text-[#333]">{plan.name}</h3>

            <div className="mt-2 space-y-1 text-sm text-gray-500">
              <p>{t("planUi.studentsCount", { count: plan.maxStudents })}</p>
              <p>{t("planUi.professorsCount", { count: plan.maxProfessors })}</p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-2xl font-bold text-[#333]">
              {formatCurrency(plan.price)}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <RedButton
            text={t("common.delete")}
            disabled={deleteMutation.isPending}
            onClick={() => setConfirmModal(true)}
            textSmall={true}
            img={<Trash2 size={18} />}
          />
          <BlackButton
            text={t("common.edit")}
            onClick={() => onEdit(plan)}
            textSmall={true}
            img={<Pencil size={18} />}
          />
        </div>
      </div>

      {confirmModal && (
        <ConfirmModal
          title={t("planUi.deleteTitle")}
          message={t("planUi.deleteConfirmation", { name: plan.name })}
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
    </>
  );
}
