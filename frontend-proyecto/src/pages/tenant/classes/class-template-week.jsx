import { useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useHasPermission } from "../../../store/tenant-store";
import {
  deleteClassTemplates,
  getClassTemplates,
} from "../../../services/class-template";

import Loading from "../../../components/loading";
import BlackButton from "../../../components/buttons/black-button";
import RedButton from "../../../components/buttons/red-button";
import ClassForm from "../../../components/classes/class-form";
import ClassModal from "../../../components/classes/class-modal";
import CopyClassTemplateDayModal from "../../../components/class-template/copy-class-template-day-modal";
import CopyClassTemplateWeekModal from "../../../components/class-template/copy-class-template-week-modal";
import ClassCard from "../../../components/classes/class-card";
import SuccessModal from "../../../components/modals/success-modal";
import ErrorModal from "../../../components/modals/error-modal";
import ConfirmModal from "../../../components/modals/confirm-modal";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatNumber } from "../../../utils/formatting";

export default function ClassTemplateWeek({ tenantId }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [openDay, setOpenDay] = useState(null);

  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [openCopyDayModal, setOpenCopyDayModal] = useState(false);
  const [openCopyWeekModal, setOpenCopyWeekModal] = useState(false);

  const [selectedDay, setSelectedDay] = useState(null);

  const [selectionModeByDay, setSelectionModeByDay] = useState({});
  const [selectedClassTemplateIds, setSelectedClassTemplateIds] = useState([]);
  const selectedClassTemplateIdSet = useMemo(
    () => new Set(selectedClassTemplateIds),
    [selectedClassTemplateIds],
  );
  const [activeSelectionDay, setActiveSelectionDay] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const [backendError, setBackendError] = useState();
  const [errorModal, setErrorModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState();
  const [successModal, setSuccessModal] = useState(false);

  const longPressTimer = useRef(null);
  const ignoreNextClick = useRef(false);
  const pointerStartPosition = useRef(null);
  const pendingDay = useRef(null);

  const canCreateClass = useHasPermission(tenantId, "CLASS_CREATE");
  const canDeleteClass = useHasPermission(tenantId, "CLASS_DELETE");

  const dayRefs = useRef({});

  const {
    data: classTemplates = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["getClassTemplates", tenantId],
    queryFn: getClassTemplates,
    staleTime: 5 * 60 * 1000,
  });

  const days = [
    { value: 1, label: t("days.1") },
    { value: 2, label: t("days.2") },
    { value: 3, label: t("days.3") },
    { value: 4, label: t("days.4") },
    { value: 5, label: t("days.5") },
    { value: 6, label: t("days.6") },
    { value: 0, label: t("days.0") },
  ];

  const clearSelection = () => {
    setSelectedClassTemplateIds([]);
    setSelectionModeByDay({});
    setActiveSelectionDay(null);
    setShowDeleteConfirmation(false);
  };

  const toggleClassSelection = (classTemplateId, dayOfWeek) => {
    const updated = selectedClassTemplateIds.includes(classTemplateId)
      ? selectedClassTemplateIds.filter((id) => id !== classTemplateId)
      : [...selectedClassTemplateIds, classTemplateId];
    const updatedIds = new Set(updated);

    const selectedForDay = classTemplates.filter(
      (template) =>
        template.dayOfWeek === dayOfWeek && updatedIds.has(template.id),
    );

    setSelectedClassTemplateIds(updated);

    setSelectionModeByDay((prevModes) => ({
      ...prevModes,
      [dayOfWeek]: selectedForDay.length > 0,
    }));

    setActiveSelectionDay((currentDay) => {
      if (selectedForDay.length > 0) {
        return dayOfWeek;
      }

      return currentDay === dayOfWeek ? null : currentDay;
    });
  };

  const selectAllTemplates = (dayOfWeek) => {
    const templatesOfDay = classTemplates.filter(
      (template) => template.dayOfWeek === dayOfWeek,
    );

    const idsOfDay = templatesOfDay.map((template) => template.id);
    const idsOfDaySet = new Set(idsOfDay);

    const allSelected =
      idsOfDay.length > 0 &&
      idsOfDay.every((id) => selectedClassTemplateIdSet.has(id));

    setSelectedClassTemplateIds((prev) => {
      if (allSelected) {
        return prev.filter((id) => !idsOfDaySet.has(id));
      }

      return [...prev.filter((id) => !idsOfDaySet.has(id)), ...idsOfDay];
    });

    setSelectionModeByDay((prev) => ({
      ...prev,
      [dayOfWeek]: !allSelected,
    }));

    setActiveSelectionDay(allSelected ? null : dayOfWeek);
  };

  const handlePointerDown = (event, classTemplate, dayOfWeek) => {
    ignoreNextClick.current = false;

    if (!canDeleteClass || event.pointerType !== "touch") return;

    clearTimeout(longPressTimer.current);

    pointerStartPosition.current = {
      x: event.clientX,
      y: event.clientY,
    };

    longPressTimer.current = setTimeout(() => {
      ignoreNextClick.current = true;

      setSelectedClassTemplateIds((prev) =>
        prev.includes(classTemplate.id) ? prev : [...prev, classTemplate.id],
      );

      setSelectionModeByDay((prev) => ({
        ...prev,
        [dayOfWeek]: true,
      }));

      setActiveSelectionDay(dayOfWeek);
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

  const handleTemplateContextMenu = (event, classTemplate, dayOfWeek) => {
    event.preventDefault();

    if (!canDeleteClass) return;

    setSelectedClassTemplateIds((prev) =>
      prev.includes(classTemplate.id) ? prev : [...prev, classTemplate.id],
    );

    setSelectionModeByDay((prev) => ({
      ...prev,
      [dayOfWeek]: true,
    }));

    setActiveSelectionDay(dayOfWeek);
  };

  const handleCardClick = (classTemplate) => {
    if (ignoreNextClick.current) return;

    if (selectionModeByDay[classTemplate.dayOfWeek]) {
      toggleClassSelection(classTemplate.id, classTemplate.dayOfWeek);
      return;
    }

    setSelectedClass(classTemplate);
  };

  const deleteMutation = useMutation({
    mutationFn: deleteClassTemplates,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["getClassTemplates", tenantId],
      });

      clearSelection();

      setSuccessMessage(
        t("classPages.templateWeek.deleteSuccess"),
      );
      setSuccessModal(true);

      setTimeout(() => {
        setSuccessModal(false);
      }, 2000);
    },

    onError: (error) => {
      const data = error?.response?.data;

      let msg = t("classPages.templateWeek.deleteError");

      if (typeof data === "string") {
        msg = data;
      } else if (data?.errors) {
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
      <div className="mt-10 rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">
        {t("classPages.templateWeek.loadError")}
      </div>
    );
  }

  return (
    <div className="mt-6 flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {canCreateClass && (
          <BlackButton
            onClick={() => setOpenCopyWeekModal(true)}
            text={t("classPages.templateWeek.copyWeek")}
            wfit
            textSmall
          />
        )}
      </div>

      <div className="flex flex-col gap-4">
        {days.map((day) => {
          const classesOfDay = classTemplates.filter(
            (classTemplate) => classTemplate.dayOfWeek === day.value,
          );

          const isOpen = openDay === day.value;
          const isSelectionMode = Boolean(selectionModeByDay[day.value]);

          const selectedCount = classesOfDay.filter((template) =>
            selectedClassTemplateIdSet.has(template.id),
          ).length;

          const allSelected =
            classesOfDay.length > 0 && selectedCount === classesOfDay.length;

          return (
            <div
              key={day.value}
              ref={(element) => {
                dayRefs.current[day.value] = element;
              }}
              className="scroll-mt-20 overflow-hidden rounded-lg border border-gray-400 shadow-md"
            >
              <button
                type="button"
                onClick={() => {
                  if (isOpen) {
                    setOpenDay(null);
                    pendingDay.current = null;
                  } else if (openDay !== null) {
                    pendingDay.current = day.value;
                    setOpenDay(null);
                  } else {
                    setOpenDay(day.value);
                  }
                }}
                className="flex w-full cursor-pointer items-center justify-between bg-[#EFECF0] px-5 py-4 transition"
              >
                <span className="text-lg font-semibold">{day.label}</span>

                <span className="text-gray-500">
                  {t(
                    classesOfDay.length === 1
                      ? "classPages.classCount_one"
                      : "classPages.classCount_other",
                    { count: formatNumber(classesOfDay.length) },
                  )}
                </span>
              </button>

              <div
                onTransitionEnd={(event) => {
                  if (event.propertyName !== "grid-template-rows") return;

                  // Terminó de cerrarse el día actual.
                  if (
                    !isOpen &&
                    pendingDay.current !== null &&
                    openDay === null
                  ) {
                    setOpenDay(pendingDay.current);
                    pendingDay.current = null;
                    return;
                  }

                  // Terminó de abrirse el día seleccionado.
                  if (isOpen) {
                    dayRefs.current[day.value]?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }
                }}
                className={`grid transition-[grid-template-rows] duration-200 ease-in-out ${
                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="border-t border-gray-400 p-4">
                    {canDeleteClass &&
                      classesOfDay.length > 0 &&
                      isSelectionMode && (
                        <div className="mb-4 flex justify-end gap-2">
                          <div className="min-[356px]:hidden">
                            <BlackButton
                              onClick={() => selectAllTemplates(day.value)}
                              text={
                                allSelected
                                  ? t("classPages.templateWeek.deselect")
                                  : t("classPages.templateWeek.select")
                              }
                              wfit
                              textSmall
                            />
                          </div>

                          <div className="hidden min-[356px]:block">
                            <BlackButton
                              onClick={() => selectAllTemplates(day.value)}
                              text={
                                allSelected
                                  ? t("classPages.templateWeek.deselectAll")
                                  : t("classPages.templateWeek.selectAll")
                              }
                              wfit
                              textSmall
                            />
                          </div>

                          <RedButton
                            onClick={() => {
                              setActiveSelectionDay(day.value);
                              setShowDeleteConfirmation(true);
                            }}
                            text={t("classPages.templateWeek.deleteSelected", {
                              count: formatNumber(selectedCount),
                            })}
                            wfit
                            textSmall
                            disabled={
                              selectedCount === 0 || deleteMutation.isPending
                            }
                          />
                        </div>
                      )}

                    {canCreateClass && !isSelectionMode && (
                      <div className="mb-4 flex justify-end gap-3">
                        <BlackButton
                          onClick={() => {
                            setSelectedDay(day.value);
                            setOpenCopyDayModal(true);
                          }}
                          text={t("classPages.templateWeek.copyDay")}
                          wfit
                          textSmall
                        />

                        <BlackButton
                          onClick={() => {
                            setSelectedDay(day.value);
                            setOpenCreateModal(true);
                          }}
                          text={t("classPages.newClass")}
                          wfit
                          textSmall
                        />
                      </div>
                    )}
                    <div className="grid gap-3">
                      {classesOfDay.length > 0 ? (
                        <div className="grid gap-3">
                          {classesOfDay.map((classTemplate) => {
                            const isSelected =
                              selectedClassTemplateIdSet.has(classTemplate.id);

                            return (
                              <ClassCard
                                key={classTemplate.id}
                                classItem={classTemplate}
                                isSelected={isSelected}
                                canSelect={canDeleteClass}
                                onToggleSelection={() =>
                                  toggleClassSelection(
                                    classTemplate.id,
                                    day.value,
                                  )
                                }
                                onPointerDown={(event) =>
                                  handlePointerDown(
                                    event,
                                    classTemplate,
                                    day.value,
                                  )
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
                                onContextMenu={(event) =>
                                  handleTemplateContextMenu(
                                    event,
                                    classTemplate,
                                    day.value,
                                  )
                                }
                                onClick={() => handleCardClick(classTemplate)}
                              />
                            );
                          })}
                        </div>
                      ) : (
                        <p className="py-6 text-center text-gray-500">
                          {t("classPages.templateWeek.emptyDay")}
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDay(day.value);
                          setOpenCreateModal(true);
                        }}
                        className="flex min-h-24.5 w-full cursor-pointer items-center justify-center rounded-lg border border-dashed border-gray-400 bg-[#F1EEF3] shadow-md transition-[background-color,border-color] duration-300 hover:border-gray-500 hover:bg-[#EFECF0]"
                      >
                        <Plus
                          size={32}
                          strokeWidth={1.5}
                          className="text-gray-500"
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {openCreateModal && (
        <ClassForm
          tenantId={tenantId}
          defaultDayOfWeek={selectedDay}
          close={() => setOpenCreateModal(false)}
          isTemplate
        />
      )}

      {selectedClass && (
        <ClassModal
          classItem={selectedClass}
          tenantId={tenantId}
          close={() => setSelectedClass(null)}
          isTemplate
        />
      )}

      {openCopyDayModal && (
        <CopyClassTemplateDayModal
          tenantId={tenantId}
          dayOfWeek={selectedDay}
          close={() => setOpenCopyDayModal(false)}
        />
      )}

      {openCopyWeekModal && (
        <CopyClassTemplateWeekModal
          tenantId={tenantId}
          close={() => setOpenCopyWeekModal(false)}
        />
      )}

      {showDeleteConfirmation && (
        <ConfirmModal
          title={t("classPages.templateWeek.deleteTitle")}
          message={t(
            classTemplates.filter(
              (template) =>
                template.dayOfWeek === activeSelectionDay &&
                selectedClassTemplateIdSet.has(template.id),
            ).length === 1
              ? "classPages.templateWeek.deleteConfirmation_one"
              : "classPages.templateWeek.deleteConfirmation_other",
            {
              count: classTemplates.filter(
                (template) =>
                  template.dayOfWeek === activeSelectionDay &&
                  selectedClassTemplateIdSet.has(template.id),
              ).length,
              countDisplay: formatNumber(
                classTemplates.filter(
                  (template) =>
                    template.dayOfWeek === activeSelectionDay &&
                    selectedClassTemplateIdSet.has(template.id),
                ).length,
              ),
              day:
                days.find((day) => day.value === activeSelectionDay)?.label ??
                t("classPages.thisDay"),
            },
          )}
          confirmText={t("classPages.confirmDelete")}
          cancelText={t("common.back")}
          isPending={deleteMutation.isPending}
          close={() => {
            if (!deleteMutation.isPending) {
              setShowDeleteConfirmation(false);
            }
          }}
          onConfirm={() => {
            const idsToDelete = classTemplates
              .filter(
                (template) =>
                  template.dayOfWeek === activeSelectionDay &&
                  selectedClassTemplateIdSet.has(template.id),
              )
              .map((template) => template.id);

            if (idsToDelete.length > 0) {
              deleteMutation.mutate(idsToDelete);
            }
          }}
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
    </div>
  );
}
