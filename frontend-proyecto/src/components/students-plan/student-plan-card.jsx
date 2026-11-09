import { Trash2, Pencil } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ErrorModal from "../modals/error-modal";
import ConfirmModal from "../modals/confirm-modal";
import { useState } from "react";
import { deleteStudentPlan } from "../../services/student-plan";
import RedButton from "../buttons/red-button";
import BlackButton from "../buttons/black-button";
import { useHasPermission } from "../../store/tenant-store";
import { formatCurrency, formatNumber } from "../../utils/formatting";
import { useTranslation } from "react-i18next";

export default function StudentPlanCard({ plan, tenantId, onEdit }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [backendError, setBackendError] = useState();
  const [errorModal, setErrorModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);

  const canUpdateStudentPlan = useHasPermission(
    tenantId,
    "STUDENT_PLAN_UPDATE",
  );
  const canDeleteStudentPlan = useHasPermission(
    tenantId,
    "STUDENT_PLAN_DELETE",
  );

  const deleteMutation = useMutation({
    mutationFn: () => deleteStudentPlan(plan.id),
    onSuccess: () => {
      setConfirmModal(false);

      queryClient.invalidateQueries({
        queryKey: ["getStudentPlans", tenantId],
      });
    },
    onError: (error) => {
      setConfirmModal(false);

      const data = error?.response?.data;
      let msg = t("studentPlanCard.deleteError");

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
      <div className="border rounded-lg border-gray-400 bg-[#EFECF0] p-5 shadow-sm flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-semibold text-[#333]">{plan.name}</h3>

            <p className="text-sm text-gray-500 mt-2">
              {t("studentPlanCard.classesPerMonth", {
                count: formatNumber(plan.classesPerMonth),
              })}
            </p>
          </div>

          <div className="text-right">
            <p className="text-2xl font-bold text-[#333]">
              {formatCurrency(plan.price)}
            </p>
          </div>
        </div>

        {(canDeleteStudentPlan || canUpdateStudentPlan) && (
          <div className="flex gap-2">
            {canDeleteStudentPlan && (
              <RedButton
                text={t("studentPlanCard.delete")}
                disabled={deleteMutation.isPending}
                onClick={() => setConfirmModal(true)}
                textSmall={true}
                img={<Trash2 size={18} />}
              />
            )}

            {canUpdateStudentPlan && (
              <BlackButton
                text={t("studentPlanCard.edit")}
                onClick={() => onEdit(plan)}
                textSmall={true}
                img={<Pencil size={18} />}
              />
            )}
          </div>
        )}
      </div>

      {confirmModal && (
        <ConfirmModal
          title={t("studentPlanCard.confirmTitle")}
          message={t("studentPlanCard.confirmMessage", { name: plan.name })}
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
