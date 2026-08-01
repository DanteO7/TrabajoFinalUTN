import { Trash2, Edit } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ErrorModal from "../modals/error-modal";
import { useState } from "react";
import { deleteStudentPlan } from "../../services/student-plan";

export default function StudentPlanCard({ plan, tenantId, onEdit }) {
  const queryClient = useQueryClient();
  const [backendError, setBackendError] = useState();
  const [errorModal, setErrorModal] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: () => deleteStudentPlan(plan.id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["getStudentPlans", tenantId],
      });
    },

    onError: (error) => {
      const data = error?.response?.data;
      let msg = "Error al eliminar el plan";

      if (typeof data === "string") msg = data;
      else if (data?.message) msg = data.message;

      setBackendError(msg);
      setErrorModal(true);
    },
  });

  return (
    <>
      <div className="border rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-[#333]">{plan.name}</h3>
            <p className="text-gray-500 mt-1">
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
          <button
            onClick={() => onEdit(plan)}
            className="flex-1 flex items-center justify-center gap-2 bg-[#333] text-white rounded-lg py-2 hover:bg-gray-700 transition cursor-pointer"
          >
            <Edit size={18} />
            Editar
          </button>

          <button
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
            className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white rounded-lg py-2 hover:bg-red-600 transition cursor-pointer disabled:opacity-50"
          >
            <Trash2 size={18} />
            {deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>

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
