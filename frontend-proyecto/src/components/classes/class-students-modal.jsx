import { Trash2, X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import Modal from "../modals/modal";
import Loading from "../loading";
import ErrorModal from "../modals/error-modal";
import SuccessModal from "../modals/success-modal";
import { FiPlus } from "react-icons/fi";

import { getStudentsByClass } from "../../services/class";
import { deleteReservation } from "../../services/reservation";
import { useState } from "react";
import ConfirmModal from "../modals/confirm-modal";
import ClassStudentCard from "./class-student-card";
import AddStudentToClassModal from "./add-student-to-class-modal";
import WhiteButton from "../buttons/white-button";
import BlackButton from "../buttons/black-button";

export default function ClassStudentsModal({
  currentClass,
  tenantId,
  maxCapacity,
  close,
  formatDateWithDay,
  decreaseReservationCount,
  increaseReservationCount,
}) {
  const classId = currentClass.id;
  const queryClient = useQueryClient();

  const [backendError, setBackendError] = useState();
  const [errorModal, setErrorModal] = useState(false);

  const [successMessage, setSuccessMessage] = useState();
  const [successModal, setSuccessModal] = useState(false);

  const [reservationToDelete, setReservationToDelete] = useState(null);
  const [openAddStudentModal, setOpenAddStudentModal] = useState(false);

  const { data: students = [], isLoading } = useQuery({
    queryKey: ["classStudents", classId],
    queryFn: () => getStudentsByClass(classId),
  });

  const deleteMutation = useMutation({
    mutationFn: (reservationId) => deleteReservation(reservationId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["classStudents", classId],
      });

      queryClient.invalidateQueries({
        queryKey: ["getClasses"],
      });

      decreaseReservationCount(1);
      setReservationToDelete(null);
      setSuccessMessage("Alumno eliminado de la clase");
      setSuccessModal(true);

      setTimeout(() => {
        setSuccessModal(false);
      }, 3000);
    },

    onError: (error) => {
      const data = error?.response?.data;

      let msg = "Ocurrió un error";

      if (typeof data === "string") msg = data;
      else if (data?.errors)
        msg = Object.values(data.errors).flat().join(" - ");
      else if (data?.message) msg = data.message;

      setReservationToDelete(null);
      setBackendError(msg);
      setErrorModal(true);
    },
  });

  return (
    <Modal open onClose={close}>
      <button
        onClick={close}
        className="absolute top-4 right-4 text-gray-500 hover:text-black cursor-pointer"
      >
        <X size={20} />
      </button>
      <h2 className="text-2xl font-semibold text-center">Alumnos inscriptos</h2>

      <div className="flex justify-center items-center">
        <div></div>
        <p className=" text-center text-gray-500 mt-2">
          {students.length} / {maxCapacity} alumnos
        </p>
      </div>

      {isLoading ? (
        <div className="mt-8">
          <Loading />
        </div>
      ) : students.length === 0 ? (
        <div className="mt-8 text-center text-gray-500">
          No hay alumnos inscriptos.
        </div>
      ) : (
        <div className="space-y-3 mt-8 max-h-100 overflow-y-auto">
          {students.map((student) => (
            <ClassStudentCard
              key={student.studentId}
              student={student}
              currentClass={currentClass}
              formatDateWithDay={formatDateWithDay}
              onDelete={() => setReservationToDelete(student)}
              isPending={deleteMutation.isPending}
            />
          ))}
        </div>
      )}
      <div className="grid grid-cols-2 gap-3 mt-8">
        <WhiteButton
          type="button"
          text="Cancelar"
          onClick={close}
          textSmall={true}
        />
        <BlackButton
          text="Agregar"
          textSmall={true}
          onClick={() => setOpenAddStudentModal(true)}
        />
      </div>
      {reservationToDelete && (
        <ConfirmModal
          title="¿Cancelar esta reserva?"
          message={`Estás por cancelar la reserva de ${
            reservationToDelete.name
          } del día ${formatDateWithDay(currentClass.date)} a las ${currentClass.startTime.slice(
            0,
            5,
          )} - ${currentClass.endTime.slice(0, 5)}.`}
          onConfirm={() =>
            deleteMutation.mutate(reservationToDelete.reservationId)
          }
          close={() => setReservationToDelete(null)}
          isPending={deleteMutation.isPending}
        />
      )}

      {errorModal && (
        <ErrorModal
          close={() => setErrorModal(false)}
          message={backendError}
          isSuccesOrError
        />
      )}

      {successModal && (
        <SuccessModal
          close={() => setSuccessModal(false)}
          message={successMessage}
          isSuccesOrError
        />
      )}
      {openAddStudentModal && (
        <AddStudentToClassModal
          close={() => setOpenAddStudentModal(false)}
          classId={classId}
          tenantId={tenantId}
          increaseReservationCount={increaseReservationCount}
        />
      )}
    </Modal>
  );
}
