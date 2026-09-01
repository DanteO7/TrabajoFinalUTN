import { X, Pencil } from "lucide-react";
import { useState } from "react";
import Modal from "../modals/modal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getStudentPlans } from "../../services/student-plan";
import SuccessModal from "../modals/success-modal";
import ErrorModal from "../modals/error-modal";
import { deleteStudent, updateStudent } from "../../services/student";
import ConfirmModal from "../modals/confirm-modal";
import BlackButton from "../buttons/black-button";
import RedButton from "../buttons/red-button";
import { Trash2 } from "lucide-react";
import WhiteButton from "../buttons/white-button";

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
      }, 2000);
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

  const updateMutation = useMutation({
    mutationFn: () =>
      updateStudent(currentStudent.id, {
        studentPlanId: selectedPlan,
        monthlyFeeStatus: selectedStatus,
      }),

    onSuccess: (updatedStudent) => {
      queryClient.invalidateQueries({
        queryKey: ["getStudents", tenantId],
      });

      setSuccessMessage("Estudiante actualizado correctamente");
      setSuccessModal(true);
      setEditing(false);
      setCurrentStudent(updatedStudent);

      setTimeout(() => {
        setSuccessModal(false);
      }, 2000);
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

            {(currentStudent.user.weight || currentStudent.user.age) && (
              <div className="flex gap-4">
                {currentStudent.user.age && (
                  <div className="bg-[#efefef] rounded-xl p-4 w-full">
                    <p className="text-sm text-gray-600 mb-1">Edad</p>
                    <p className="font-semibold text-[#333]">
                      {currentStudent.user.age} Años
                    </p>
                  </div>
                )}
                {currentStudent.user.weight && (
                  <div className="bg-[#efefef] rounded-xl p-4 w-full">
                    <p className="text-sm text-gray-600 mb-1">Peso</p>
                    <p className="font-semibold text-[#333]">
                      {currentStudent.user.weight} Kg
                    </p>
                  </div>
                )}
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

          <div className="grid grid-cols-2 gap-3 max-[360px]:text-[13px]">
            <RedButton
              text="Eliminar"
              img={<Trash2 size={18} />}
              onClick={() => setConfirmModal(true)}
              textSmall={true}
            />
            <BlackButton
              text="Editar"
              img={<Pencil size={18} />}
              onClick={() => setEditing(true)}
              textSmall={true}
            />
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
          </div>

          <div className="flex justify-end gap-3">
            <WhiteButton
              text="Cancelar"
              onClick={() => {
                setEditing(false);
                setSelectedStatus(currentStudent.monthlyFeeStatus);
                setSelectedPlan(currentStudent.studentPlanId);
              }}
              textSmall={true}
            />
            <BlackButton
              text={updateMutation.isPending ? "Actualizando..." : "Actualizar"}
              onClick={() => updateMutation.mutate()}
              textSmall={true}
            />
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
