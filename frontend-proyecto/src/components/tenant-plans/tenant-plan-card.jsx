import { Trash2, Edit } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ErrorModal from "../modals/error-modal";
import ConfirmModal from "../modals/confirm-modal";
import { useState } from "react";
import { deleteTenantPlan } from "../../services/tenant-plan";

export default function TenantPlanCard({ plan, onEdit }) {
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
      <div className=" border rounded-2xl p-5 shadow-sm">
        <div className="flex justify-between items-start mb-5">
          <div>
            <h3 className="text-xl font-semibold text-[#333]">{plan.name}</h3>

            <div className="mt-2 space-y-1 text-sm text-gray-500">
              <p>{plan.maxStudents} alumnos</p>
              <p>{plan.maxProfessors} profesores</p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-2xl font-bold text-[#333]">
              ${plan.price.toLocaleString("es-AR")}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onEdit(plan)}
            className="flex-1 flex items-center justify-center gap-2 bg-[#333] text-white rounded-lg py-2 hover:bg-gray-700 transition cursor-pointer"
          >
            <Edit size={18} />
            Editar
          </button>

          <button
            onClick={() => setConfirmModal(true)}
            disabled={deleteMutation.isPending}
            className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white rounded-lg py-2 hover:bg-red-600 transition cursor-pointer disabled:opacity-50"
          >
            <Trash2 size={18} />
            Eliminar
          </button>
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
