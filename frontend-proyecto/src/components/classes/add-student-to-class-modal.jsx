import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, X } from "lucide-react";
import Modal from "../modals/modal";
import { getStudents } from "../../services/student";
import { createReservation } from "../../services/reservation";
import SuccessModal from "../modals/success-modal";
import ErrorModal from "../modals/error-modal";

export default function AddStudentToClassModal({
  classId,
  tenantId,
  close,
  increaseReservationCount,
}) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [errorModal, setErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successModal, setSuccessModal] = useState(false);

  const { data: students = [] } = useQuery({
    queryKey: ["students", { tenantId, classId, search }],
    queryFn: () =>
      getStudents({
        tenantId,
        classId,
        search: search || undefined,
      }),
    enabled: !!classId && !!tenantId,
  });
  console.log(students);

  const addMutation = useMutation({
    mutationFn: (student) =>
      createReservation({
        classId,
        tenantId,
        studentId: student.id,
        reservationDate: new Date().toISOString(),
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["classStudents", classId],
      });
      queryClient.invalidateQueries({
        queryKey: ["getClasses", tenantId],
      });
      increaseReservationCount(1);
      setSuccessModal(true);
      setTimeout(() => {
        close();
      }, 2000);
    },

    onError: (error) => {
      const data = error?.response?.data;
      const msg =
        typeof data === "string"
          ? data
          : data?.message || "Error al agregar estudiante";
      setErrorMessage(msg);
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

      <h2 className="text-2xl font-semibold mb-4">Agregar estudiante</h2>

      <div className="relative mb-4">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre, apellido o email..."
          className="w-full border rounded-xl pl-10 pr-3 py-2 outline-none"
        />
      </div>

      <div className="max-h-96 overflow-y-auto space-y-2">
        {students.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No se encontraron estudiantes disponibles
          </p>
        ) : (
          students.map((student) => (
            <div
              key={student.id}
              className="border rounded-xl p-3 hover:bg-gray-50 cursor-pointer"
              onClick={() => setSelectedStudent(student)}
            >
              <p className="font-semibold">
                {student.user.name} {student.user.surname}
              </p>
              <p className="text-sm text-gray-600">{student.user.email}</p>
            </div>
          ))
        )}
      </div>

      <div className="flex justify-end gap-3 mt-4">
        <button onClick={close} className="border px-4 py-2 rounded-xl">
          Cancelar
        </button>

        <button
          onClick={() => addMutation.mutate(selectedStudent)}
          disabled={!selectedStudent || addMutation.isPending}
          className="bg-[#333] text-white px-4 py-2 rounded-xl hover:bg-gray-700 disabled:opacity-50"
        >
          {addMutation.isPending ? "Agregando..." : "Agregar"}
        </button>
      </div>

      {errorModal && (
        <ErrorModal
          message={errorMessage}
          close={() => setErrorModal(false)}
          isSuccesOrError={true}
        />
      )}

      {successModal && (
        <SuccessModal
          message="Estudiante agregado correctamente"
          close={() => setSuccessModal(false)}
          isSuccesOrError={true}
        />
      )}
    </Modal>
  );
}
