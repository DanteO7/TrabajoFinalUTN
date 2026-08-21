import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, X } from "lucide-react";
import { Check } from "lucide-react";
import Modal from "../modals/modal";
import { getStudents } from "../../services/student";
import SuccessModal from "../modals/success-modal";
import ErrorModal from "../modals/error-modal";
import WhiteButton from "../buttons/white-button";
import BlackButton from "../buttons/black-button";
import { createReservation } from "../../services/reservation";

export default function AddStudentToClassModal({
  classId,
  tenantId,
  close,
  increaseReservationCount,
}) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);

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

  const toggleStudent = (studentId) => {
    setSelectedStudents((prev) => {
      if (prev.includes(studentId)) {
        return prev.filter((id) => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  const addMutation = useMutation({
    mutationFn: () =>
      createReservation({ classId, tenantId, studentIds: selectedStudents }),

    onSuccess: () => {
      increaseReservationCount(selectedStudents.length);
      queryClient.invalidateQueries({
        queryKey: ["classStudents", classId],
      });
      queryClient.invalidateQueries({
        queryKey: ["getClasses", tenantId],
      });

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
          : data?.message || "Error al agregar alumnos";
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

      <h2 className="text-2xl font-semibold mb-4">Agregar alumnos</h2>

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

      {selectedStudents.length > 0 && (
        <p className="text-sm text-gray-600 mb-3">
          {selectedStudents.length} estudiante(s) seleccionado(s)
        </p>
      )}

      <div className="max-h-96 overflow-y-auto space-y-2">
        {students.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No se encontraron alumnos disponibles
          </p>
        ) : (
          students.map((student) => {
            const isSelected = selectedStudents.includes(student.id);
            return (
              <div
                key={student.id}
                onClick={() => toggleStudent(student.id)}
                className={`border rounded-xl p-3 cursor-pointer transition ${
                  isSelected ? "bg-blue-50 border-blue-300" : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {isSelected && (
                      <Check size={20} className="text-blue-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">
                      {student.user.name} {student.user.surname}
                    </p>
                    <p className="text-sm text-gray-600">
                      {student.user.email}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mt-8">
        <WhiteButton
          type="button"
          text="Cancelar"
          onClick={close}
          textSmall={true}
        />
        <BlackButton
          text={
            addMutation.isPending
              ? "Agregando..."
              : `Agregar (${selectedStudents.length})`
          }
          textSmall={true}
          onClick={() => addMutation.mutate()}
          disabled={selectedStudents.length === 0 || addMutation.isPending}
        />
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
          message={`${selectedStudents.length} estudiante(s) agregado(s) correctamente`}
          close={() => setSuccessModal(false)}
          isSuccesOrError={true}
        />
      )}
    </Modal>
  );
}
