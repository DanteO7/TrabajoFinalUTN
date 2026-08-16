import { Trash2, Edit } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ErrorModal from "../modals/error-modal";
import ConfirmModal from "../modals/confirm-modal";
import { useState } from "react";
import { deleteStudentPlan } from "../../services/student-plan";
import RedButton from "../buttons/red-button";
import BlackButton from "../buttons/black-button";
import { Pencil } from "lucide-react";

export default function StudentPlanCard({ plan, tenantId, onEdit }) {
  const queryClient = useQueryClient();

  const [backendError, setBackendError] = useState();
  const [errorModal, setErrorModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);

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

      let msg = "Error al eliminar el plan";

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
      <div className="border rounded-2xl p-5 shadow-sm">
        <div className="flex justify-between items-start mb-5">
          <div>
            <h3 className="text-xl font-semibold text-[#333]">{plan.name}</h3>

            <p className="text-sm text-gray-500 mt-2">
              {plan.classesPerMonth} clases/mes
            </p>
          </div>

          <div className="text-right">
            <p className="text-2xl font-bold text-[#333]">
              ${plan.price.toLocaleString("es-AR")}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <RedButton
            text="Eliminar"
            disabled={deleteMutation.isPending}
            onClick={() => setConfirmModal(true)}
            textSmall={true}
            img={<Trash2 size={18} />}
          />
          <BlackButton
            text="Editar"
            onClick={() => onEdit(plan)}
            textSmall={true}
            img={<Pencil size={18} />}
          />
        </div>
      </div>

      {confirmModal && (
        <ConfirmModal
          title="¿Eliminar este plan?"
          message={`Estás por eliminar el plan "${plan.name}". Esta acción no se puede deshacer.`}
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
