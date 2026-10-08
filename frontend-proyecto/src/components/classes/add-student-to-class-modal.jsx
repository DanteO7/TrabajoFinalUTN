import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { Check } from "lucide-react";
import Modal from "../modals/modal";
import { getStudents } from "../../services/student";
import SuccessModal from "../modals/success-modal";
import ErrorModal from "../modals/error-modal";
import WhiteButton from "../buttons/white-button";
import BlackButton from "../buttons/black-button";
import { createReservation } from "../../services/reservation";
import SearchInput from "../inputs/search-input";
import {
  addStudentToClassTemplate,
  getClassTemplates,
} from "../../services/classTemplate";

export default function AddStudentToClassModal({
  classId,
  tenantId,
  close,
  increaseReservationCount,
  isTemplate = false,
  currentClass,
  onClassUpdated,
}) {
  const queryClient = useQueryClient();
  const [inputValue, setInputValue] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);

  const [errorModal, setErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successModal, setSuccessModal] = useState(false);

  const { data: students = [] } = useQuery({
    queryKey: ["students", { tenantId, classId, inputValue }],
    queryFn: () =>
      getStudents({
        tenantId,
        classId,
        search: inputValue || undefined,
      }),
    enabled: !!classId && !!tenantId,
  });

  const availableStudents = isTemplate
    ? students?.filter(
        (student) =>
          !currentClass.students?.some(
            (classStudent) => classStudent.studentId === student.id,
          ),
      )
    : students;

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
    mutationFn: async () => {
      if (isTemplate) {
        console.log("xd");
        await Promise.all(
          selectedStudents.map((studentId) =>
            addStudentToClassTemplate(classId, studentId),
          ),
        );

        return;
      }

      return createReservation({
        classId,
        tenantId,
        studentIds: selectedStudents,
      });
    },

    onSuccess: async () => {
      if (isTemplate) {
        const updatedClassTemplates = await queryClient.fetchQuery({
          queryKey: ["getClassTemplates", tenantId],
          queryFn: getClassTemplates,
        });

        const updatedClass = updatedClassTemplates.find(
          (classTemplate) => classTemplate.id === classId,
        );

        if (updatedClass) {
          onClassUpdated(updatedClass);
        }

        setSuccessModal(true);

        setTimeout(() => {
          close();
        }, 2000);

        return;
      }

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

      <div className="mb-4">
        <SearchInput
          value={inputValue}
          onChange={setInputValue}
          placeholder="Buscar por nombre, apellido o email..."
        />
      </div>

      {selectedStudents.length > 0 && (
        <p className="text-sm text-gray-600 mb-3">
          {selectedStudents.length} estudiante(s) seleccionado(s)
        </p>
      )}

      <div className="max-h-96 overflow-y-auto space-y-2">
        {availableStudents.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No se encontraron alumnos disponibles
          </p>
        ) : (
          availableStudents.map((student) => {
            const isSelected = selectedStudents.includes(student.id);
            return (
              <div
                key={student.id}
                onClick={() => toggleStudent(student.id)}
                className={`border rounded-lg border-gray-400 p-3 cursor-pointer bg-[#F1EEF3] transition ${
                  isSelected
                    ? "bg-red-100 border-red-400"
                    : "hover:bg-[#F1EEF3]"
                }`}
              >
                <div className="flex justify-between gap-3 items-center px-1">
                  <div>
                    <p className="font-semibold">
                      {student.user.name} {student.user.surname}
                    </p>
                    <p className="text-sm text-gray-600">
                      {student.user.email}
                    </p>
                  </div>
                  <div className="mt-1 w-5 flex justify-center items-center">
                    {isSelected && <Check size={20} color="#FC697B" />}
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
