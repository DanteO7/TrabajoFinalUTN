import { Trash2, X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import Modal from "../modals/modal";
import Loading from "../loading";
import ErrorModal from "../modals/error-modal";
import SuccessModal from "../modals/success-modal";

import { getStudentsByClass } from "../../services/class";
import { deleteReservation } from "../../services/reservation";
import { useState } from "react";

export default function ClassStudentsModal({
  classId,
  tenantId,
  maxCapacity,
  close,
}) {
  const queryClient = useQueryClient();

  const [backendError, setBackendError] = useState();
  const [errorModal, setErrorModal] = useState(false);

  const [successMessage, setSuccessMessage] = useState();
  const [successModal, setSuccessModal] = useState(false);

  const { data: students = [], isLoading } = useQuery({
    queryKey: ["classStudents", classId],
    queryFn: () => getStudentsByClass(classId),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteReservation,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["classStudents", classId],
      });

      queryClient.invalidateQueries({
        queryKey: ["getClasses", tenantId],
      });

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

      <p className="text-center text-gray-500 mt-2">
        {students.length} / {maxCapacity} alumnos
      </p>

      {isLoading ? (
        <div className="mt-8">
          <Loading />
        </div>
      ) : students.length === 0 ? (
        <div className="mt-8 text-center text-gray-500">
          No hay alumnos inscriptos.
        </div>
      ) : (
        <div className="space-y-3 mt-8 max-h-[400px] overflow-y-auto">
          {students.map((student) => (
            <div
              key={student.reservationId}
              className="border rounded-xl p-4 flex justify-between items-center"
            >
              <div>
                <h3 className="font-semibold">
                  {student.name} {student.surname}
                </h3>

                <p className="text-sm text-gray-500">{student.email}</p>
              </div>

              <button
                onClick={() => deleteMutation.mutate(student.reservationId)}
                disabled={deleteMutation.isPending}
                className="text-red-600 hover:text-red-800 transition cursor-pointer"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>
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
    </Modal>
  );
}
