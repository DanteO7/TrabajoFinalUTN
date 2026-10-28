import { useMemo, useState, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DayPicker } from "react-day-picker";
import "../../../css/day-picker.css";
import "react-day-picker/dist/style.css";

import { useHasPermission } from "../../../store/tenant-store";
import Loading from "../../../components/loading";
import BlackButton from "../../../components/buttons/black-button";
import RedButton from "../../../components/buttons/red-button";
import ClassForm from "../../../components/classes/class-form";
import ClassModal from "../../../components/classes/class-modal";
import { deleteClasses, getClasses } from "../../../services/class";
import ClassCard from "../../../components/classes/class-card";
import ConfirmModal from "../../../components/modals/confirm-modal";
import SuccessModal from "../../../components/modals/success-modal";
import ErrorModal from "../../../components/modals/error-modal";

export default function OfficialClasses({ tenantId }) {
  const queryClient = useQueryClient();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [openModal, setOpenModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);

  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedClassIds, setSelectedClassIds] = useState([]);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const [backendError, setBackendError] = useState();
  const [errorModal, setErrorModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState();
  const [successModal, setSuccessModal] = useState(false);

  const longPressTimer = useRef(null);
  const ignoreNextClick = useRef(false);
  const pointerStartPosition = useRef(null);

  const canCreateClass = useHasPermission(tenantId, "CLASS_CREATE");
  const canDeleteClass = useHasPermission(tenantId, "CLASS_DELETE");

  const formatLocalDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const {
    data: classes = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["getClasses", tenantId, formatLocalDate(selectedDate)],
    queryFn: () => getClasses(tenantId, formatLocalDate(selectedDate)),
    staleTime: 5 * 60 * 1000,
  });

  const classesOfDay = useMemo(() => {
    const selectedDateString = formatLocalDate(selectedDate);

    return classes.filter((classItem) => {
      const classDateString = classItem.date.split("T")[0];
      return classDateString === selectedDateString;
    });
  }, [classes, selectedDate]);

  const isDateInPast =
    formatLocalDate(selectedDate) < formatLocalDate(new Date());

  const toggleClassSelection = (classId) => {
    setSelectedClassIds((prev) => {
      const updated = prev.includes(classId)
        ? prev.filter((id) => id !== classId)
        : [...prev, classId];

      if (updated.length === 0) {
        setSelectionMode(false);
        setShowDeleteConfirmation(false);
      }

      return updated;
    });
  };

  const clearSelection = () => {
    setSelectedClassIds([]);
    setSelectionMode(false);
    setShowDeleteConfirmation(false);
  };

  const selectAllClasses = () => {
    const idsOfDay = classesOfDay.map((classItem) => classItem.id);

    const allSelected =
      idsOfDay.length > 0 &&
      idsOfDay.every((id) => selectedClassIds.includes(id));

    if (allSelected) {
      setSelectedClassIds((prev) =>
        prev.filter((id) => !idsOfDay.includes(id)),
      );

      if (selectedClassIds.every((id) => idsOfDay.includes(id))) {
        setSelectionMode(false);
        setShowDeleteConfirmation(false);
      }
    } else {
      setSelectedClassIds((prev) => [...new Set([...prev, ...idsOfDay])]);

      setSelectionMode(true);
    }
  };

  const handlePointerDown = (event, classId) => {
    ignoreNextClick.current = false;

    if (!canDeleteClass || event.pointerType !== "touch") return;

    clearTimeout(longPressTimer.current);

    pointerStartPosition.current = {
      x: event.clientX,
      y: event.clientY,
    };

    longPressTimer.current = setTimeout(() => {
      ignoreNextClick.current = true;

      setSelectedClassIds((prev) =>
        prev.includes(classId) ? prev : [...prev, classId],
      );

      setSelectionMode(true);
    }, 500);
  };

  const handlePointerMove = (event) => {
    if (!pointerStartPosition.current) return;

    const deltaX = Math.abs(event.clientX - pointerStartPosition.current.x);

    const deltaY = Math.abs(event.clientY - pointerStartPosition.current.y);

    if (deltaX > 10 || deltaY > 10) {
      clearTimeout(longPressTimer.current);
      pointerStartPosition.current = null;
    }
  };

  const handlePointerEnd = () => {
    clearTimeout(longPressTimer.current);
    pointerStartPosition.current = null;
  };

  const handleCardClick = (classItem) => {
    if (ignoreNextClick.current) return;

    if (selectionMode) {
      toggleClassSelection(classItem.id);
      return;
    }

    setSelectedClass(classItem);
  };

  const deleteMutation = useMutation({
    mutationFn: deleteClasses,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["getClasses", tenantId],
      });

      clearSelection();
      setSuccessMessage(
        "Las clases seleccionadas y sus reservas se eliminaron correctamente.",
      );
      setSuccessModal(true);

      setTimeout(() => {
        setSuccessModal(false);
      }, 2000);
    },

    onError: (error) => {
      const data = error?.response?.data;

      let msg = "Ocurrió un error al eliminar las clases.";

      if (typeof data === "string") msg = data;
      else if (data?.errors) {
        msg = Object.values(data.errors).flat().join(" - ");
      } else if (data?.message) {
        msg = data.message;
      }

      setBackendError(msg);
      setErrorModal(true);
    },
  });

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">
        Esta página no existe o no tienes acceso.
      </div>
    );
  }

  const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  return (
    <>
      <div className="mt-10 flex flex-col gap-10 xl:flex-row">
        <div className="mx-auto">
          <DayPicker
            mode="single"
            weekStartsOn={1}
            selected={selectedDate}
            defaultMonth={selectedDate}
            onSelect={(date) => {
              if (date) {
                clearSelection();
                setSelectedDate(date);
              }
            }}
            formatters={{
              formatWeekdayName: (date) => days[date.getDay()],
              formatCaption: (date) =>
                `${months[date.getMonth()]} ${date.getFullYear()}`,
            }}
            className="rounded-2xl border px-4 py-3 shadow-md"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold">
              Clases del {selectedDate.toLocaleDateString("es-AR")}
            </h2>

            <div className="grid grid-cols-[1.4fr_1fr]  min-[900px]:flex min-[900px]:gap-2">
              {selectionMode && (
                <>
                  <BlackButton
                    onClick={selectAllClasses}
                    text={
                      classesOfDay.length > 0 &&
                      classesOfDay.every((classItem) =>
                        selectedClassIds.includes(classItem.id),
                      )
                        ? "Deseleccionar todo"
                        : "Seleccionar todo"
                    }
                    wfit
                    textSmall
                  />

                  {canDeleteClass && (
                    <div className="justify-self-end">
                      <RedButton
                        onClick={() => setShowDeleteConfirmation(true)}
                        text={`Eliminar (${selectedClassIds.length})`}
                        wfit
                        textSmall
                        disabled={
                          selectedClassIds.length === 0 ||
                          deleteMutation.isPending
                        }
                      />
                    </div>
                  )}
                </>
              )}

              {canCreateClass && !isDateInPast && !selectionMode && (
                <BlackButton
                  onClick={() => setOpenModal(true)}
                  text="+ Nueva clase"
                  wfit
                  textSmall
                />
              )}
            </div>
          </div>
          <div className="grid gap-5">
            {classesOfDay.length > 0 ? (
              classesOfDay.map((classItem) => {
                const isSelected = selectedClassIds.includes(classItem.id);

                return (
                  <ClassCard
                    key={classItem.id}
                    classItem={classItem}
                    isSelected={isSelected}
                    canSelect={canDeleteClass}
                    onToggleSelection={() => toggleClassSelection(classItem.id)}
                    onPointerDown={(event) =>
                      handlePointerDown(event, classItem.id)
                    }
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerEnd}
                    onPointerCancel={handlePointerEnd}
                    onClickCapture={(event) => {
                      if (ignoreNextClick.current) {
                        ignoreNextClick.current = false;
                        event.preventDefault();
                        event.stopPropagation();
                      }
                    }}
                    onContextMenu={(event) => {
                      event.preventDefault();

                      if (!canDeleteClass) return;

                      setSelectedClassIds((prev) =>
                        prev.includes(classItem.id)
                          ? prev
                          : [...prev, classItem.id],
                      );

                      setSelectionMode(true);
                    }}
                    onClick={() => handleCardClick(classItem)}
                  />
                );
              })
            ) : isDateInPast ? (
              <div className="rounded-lg border border-gray-400 bg-[#EFECF0] py-16 text-center">
                <h3 className="text-xl font-semibold text-red-600">
                  {canCreateClass
                    ? "No puedes crear clases para días anteriores"
                    : "No hubo clases este día"}
                </h3>

                <p className="mt-2 text-gray-500">
                  Seleccioná una fecha futura para ver las clases disponibles.
                </p>
              </div>
            ) : !canCreateClass ? (
              <div className="rounded-lg border border-gray-400 bg-[#EFECF0] py-16 text-center">
                <h3 className="text-xl font-semibold">
                  No hay clases este día
                </h3>

                <p className="mt-2 text-gray-500">
                  Esperá a que los profesores creen clases para esta fecha.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center rounded-lg border border-gray-400 bg-[#EFECF0] py-16 text-center">
                <h3 className="text-xl font-semibold">
                  No hay clases este día
                </h3>

                <p className="mb-6 mt-2 text-gray-500">
                  Creá una nueva clase para esta fecha.
                </p>

                <BlackButton
                  onClick={() => setOpenModal(true)}
                  text="+ Crear clase"
                  wfit
                  textSmall
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {openModal && (
        <ClassForm
          tenantId={tenantId}
          defaultDate={formatLocalDate(selectedDate)}
          close={() => setOpenModal(false)}
        />
      )}

      {selectedClass && (
        <ClassModal
          classItem={selectedClass}
          tenantId={tenantId}
          close={() => setSelectedClass(null)}
        />
      )}

      {showDeleteConfirmation && (
        <ConfirmModal
          title="¿Eliminar las clases seleccionadas?"
          message={`Vas a eliminar ${selectedClassIds.length} ${
            selectedClassIds.length === 1 ? "clase" : "clases"
          } y todas las reservas asociadas.\n\nEsta acción no se puede deshacer.`}
          confirmText="Sí, eliminar"
          cancelText="Volver"
          isPending={deleteMutation.isPending}
          close={() => {
            if (!deleteMutation.isPending) {
              setShowDeleteConfirmation(false);
            }
          }}
          onConfirm={() => deleteMutation.mutate(selectedClassIds)}
        />
      )}

      {successModal && (
        <SuccessModal
          message={successMessage}
          close={() => setSuccessModal(false)}
          isSuccesOrError
        />
      )}

      {errorModal && (
        <ErrorModal
          message={backendError}
          close={() => setErrorModal(false)}
          isSuccesOrError
        />
      )}
    </>
  );
}
