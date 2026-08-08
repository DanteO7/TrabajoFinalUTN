import { X, Pencil } from "lucide-react";
import { useState } from "react";
import Modal from "../modals/modal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getStudentPlans } from "../../services/student-plan";
import SuccessModal from "../modals/success-modal";
import ErrorModal from "../modals/error-modal";
import {
  deleteStudent,
  updateStudentPlan,
  updateStudentStatus,
} from "../../services/student";
import ConfirmModal from "../modals/confirm-modal";

export default function StudentModal({ student, tenantId, close }) {
  const queryClient = useQueryClient();

  const [editing, setEditing] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(student);
  const [selectedStatus, setSelectedStatus] = useState(
    currentStudent.monthlyFeeStatus,
  );
  const [selectedPlan, setSelectedPlan] = useState(
    currentStudent.studentPlanId,
  );

  const [backendError, setBackendError] = useState();
  const [errorModal, setErrorModal] = useState(false);

  const [successMessage, setSuccessMessage] = useState();
  const [successModal, setSuccessModal] = useState(false);

  const [confirmModal, setConfirmModal] = useState(false);

  const { data: plans = [] } = useQuery({
    queryKey: ["getStudentPlans", tenantId],
    queryFn: () => getStudentPlans(tenantId),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteStudent(currentStudent.id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["getStudents", tenantId],
      });
      setConfirmModal(false);

      setSuccessMessage("Alumno eliminado correctamente");
      setSuccessModal(true);

      setTimeout(() => {
        close();
      }, 3000);
    },

    onError: (error) => {
      setConfirmModal(false);

      const data = error?.response?.data;

      let msg = "Ocurrió un error al eliminar el alumno";

      if (typeof data === "string") msg = data;
      else if (data?.errors)
        msg = Object.values(data.errors).flat().join(" - ");
      else if (data?.message) msg = data.message;

      setBackendError(msg);
      setErrorModal(true);
    },
  });

  const statusMutation = useMutation({
    mutationFn: () =>
      updateStudentStatus(currentStudent.id, {
        monthlyFeeStatus: selectedStatus,
      }),

    onSuccess: (updatedStudent) => {
      queryClient.invalidateQueries({
        queryKey: ["getStudents", tenantId],
      });

      setSuccessMessage("Estado de cuota actualizado correctamente");
      setSuccessModal(true);

      setCurrentStudent(updatedStudent);

      setTimeout(() => {
        setSuccessModal(false);
      }, 3000);
    },

    onError: (error) => {
      const data = error?.response?.data;

      let msg = "Ocurrió un error al actualizar el estado";

      if (typeof data === "string") msg = data;
      else if (data?.errors)
        msg = Object.values(data.errors).flat().join(" - ");
      else if (data?.message) msg = data.message;

      setBackendError(msg);
      setErrorModal(true);
      setSelectedStatus(currentStudent.monthlyFeeStatus);
    },
  });

  const planMutation = useMutation({
    mutationFn: () =>
      updateStudentPlan(currentStudent.id, {
        studentPlanId: selectedPlan,
      }),

    onSuccess: (updatedStudent) => {
      queryClient.invalidateQueries({
        queryKey: ["getStudents", tenantId],
      });

      setSuccessMessage("Plan actualizado correctamente");
      setSuccessModal(true);

      setCurrentStudent(updatedStudent);

      setTimeout(() => {
        setSuccessModal(false);
      }, 3000);
    },

    onError: (error) => {
      const data = error?.response?.data;

      let msg = "Ocurrió un error al cambiar el plan";

      if (typeof data === "string") msg = data;
      else if (data?.errors)
        msg = Object.values(data.errors).flat().join(" - ");
      else if (data?.message) msg = data.message;

      setBackendError(msg);
      setErrorModal(true);
      setSelectedPlan(currentStudent.studentPlanId);
    },
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Overdue":
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
      case "Overdue":
        return "Vencido";
      default:
        return status;
    }
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
          <h2 className="text-2xl font-semibold mb-2">
            {currentStudent.user.name} {currentStudent.user.surname}
          </h2>

          <p className="text-gray-600 mb-6">{currentStudent.user.email}</p>

          <div className="space-y-4 mb-8">
            <div className="bg-[#efefef] rounded-xl p-4">
              <p className="text-sm text-gray-600 mb-1">Email</p>
              <p className="font-semibold text-[#333]">
                {currentStudent.user.email}
              </p>
            </div>

            {currentStudent.user.phoneNumber && (
              <div className="bg-[#efefef] rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-1">Teléfono</p>
                <p className="font-semibold text-[#333]">
                  {currentStudent.user.phoneNumber}
                </p>
              </div>
            )}

            <div className="bg-[#efefef] rounded-xl p-4">
              <p className="text-sm text-gray-600 mb-1">Plan</p>
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-[#333]">
                    {currentStudent.studentPlan.name}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {currentStudent.studentPlan.classesPerMonth} clases/mes
                  </p>
                </div>
                <p className="font-bold text-[#333]">
                  ${currentStudent.studentPlan.price.toLocaleString("es-AR")}
                </p>
              </div>
            </div>

            <div className="bg-[#efefef] rounded-xl p-4">
              <p className="text-sm text-gray-600 mb-2">Estado de cuota</p>
              <span
                className={`inline-block text-sm font-medium rounded-full px-3 py-1 ${getStatusColor(
                  currentStudent.monthlyFeeStatus,
                )}`}
              >
                {getStatusLabel(currentStudent.monthlyFeeStatus)}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-3 max-[360px]:text-[13px]">
            <button
              onClick={() => setConfirmModal(true)}
              className="text-red-600 border border-red-600 rounded-xl px-4 py-2 hover:bg-red-600 hover:text-white transition cursor-pointer"
            >
              Eliminar alumno
            </button>

            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 bg-[#333] text-white px-4 py-2 rounded-xl hover:bg-gray-700"
            >
              <Pencil size={18} />
              Editar
            </button>
          </div>
        </>
      ) : (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-center">Editar alumno</h2>

          <div>
            <label className="block text-sm font-semibold mb-3">
              Cambiar plan
            </label>

            <select
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(parseInt(e.target.value))}
              className="w-full border rounded-xl px-3 py-2 bg-[#efefef] focus:outline-none focus:ring-2 focus:ring-[#333]"
            >
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} - ${plan.price.toLocaleString("es-AR")} (
                  {plan.classesPerMonth} clases/mes)
                </option>
              ))}
            </select>

            {selectedPlan !== currentStudent.studentPlanId && (
              <button
                onClick={() => planMutation.mutate()}
                disabled={planMutation.isPending}
                className="w-full mt-2 bg-[#333] text-white rounded-xl py-2 hover:bg-gray-700 transition disabled:opacity-50"
              >
                {planMutation.isPending ? "Actualizando..." : "Actualizar plan"}
              </button>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-3">
              Estado de cuota
            </label>

            <div className="space-y-2">
              {["Paid", "Pending", "Overdue"].map((status) => (
                <div
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition ${
                    selectedStatus === status
                      ? "border-[#333] bg-[#efefef]"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <p className="font-semibold text-[#333]">
                    {getStatusLabel(status)}
                  </p>
                </div>
              ))}
            </div>

            {selectedStatus !== currentStudent.monthlyFeeStatus && (
              <button
                onClick={() => statusMutation.mutate()}
                disabled={statusMutation.isPending}
                className="w-full mt-4 bg-[#333] text-white rounded-xl py-2 hover:bg-gray-700 transition disabled:opacity-50"
              >
                {statusMutation.isPending
                  ? "Actualizando..."
                  : "Actualizar estado"}
              </button>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setEditing(false);
                setSelectedStatus(currentStudent.monthlyFeeStatus);
                setSelectedPlan(currentStudent.studentPlanId);
              }}
              className="border px-4 py-2 rounded-xl"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
      {confirmModal && (
        <ConfirmModal
          title="¿Eliminar este alumno?"
          message={`Estás por eliminar el alumno "${currentStudent.user.name} ${currentStudent.user.surname} ". Esta acción no se puede deshacer.`}
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
