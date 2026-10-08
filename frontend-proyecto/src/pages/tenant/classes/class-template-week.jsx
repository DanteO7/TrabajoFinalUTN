import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useHasPermission } from "../../../store/tenant-store";
import { getClassTemplates } from "../../../services/classTemplate";
import Loading from "../../../components/loading";
import BlackButton from "../../../components/buttons/black-button";
import ClassForm from "../../../components/classes/class-form";
import ClassModal from "../../../components/classes/class-modal";
import CopyClassTemplateDayModal from "../../../components/class-template/copy-class-template-day-modal";
import CopyClassTemplateWeekModal from "../../../components/class-template/copy-class-template-week-modal";

export default function ClassTemplateWeek({ tenantId }) {
  const [openDay, setOpenDay] = useState(null);

  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [openCopyDayModal, setOpenCopyDayModal] = useState(false);
  const [openCopyWeekModal, setOpenCopyWeekModal] = useState(false);

  const [selectedDay, setSelectedDay] = useState(null);

  const canCreateClass = useHasPermission(tenantId, "CLASS_CREATE");

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
    { value: 1, label: "Lunes" },
    { value: 2, label: "Martes" },
    { value: 3, label: "Miércoles" },
    { value: 4, label: "Jueves" },
    { value: 5, label: "Viernes" },
    { value: 6, label: "Sábado" },
    { value: 0, label: "Domingo" },
  ];

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-700 mt-10">
        No se pudo cargar la semana modelo.
      </div>
    );
  }

  return (
    <div className="mt-10 flex flex-col gap-4">
      <BlackButton
        onClick={() => {
          setOpenCopyWeekModal(true);
        }}
        text="Copiar semana"
        wfit={true}
        textSmall={true}
      />
      <div className="flex flex-col gap-4">
        {days.map((day) => {
          const classesOfDay = classTemplates.filter(
            (classTemplate) => classTemplate.dayOfWeek === day.value,
          );

          const isOpen = openDay === day.value;

          return (
            <div
              key={day.value}
              className="border border-gray-400 rounded-lg overflow-hidden shadow-md"
            >
              <button
                type="button"
                onClick={() => setOpenDay(isOpen ? null : day.value)}
                className="w-full flex items-center justify-between px-5 py-4 bg-[#EFECF0] transition cursor-pointer"
              >
                <span className="text-lg font-semibold">{day.label}</span>

                <span className="text-gray-500">
                  {classesOfDay.length}{" "}
                  {classesOfDay.length === 1 ? "clase" : "clases"}
                </span>
              </button>

              <div
                className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="p-4 border-t border-gray-400">
                    {canCreateClass && (
                      <div className="flex justify-end gap-3 mb-4">
                        <BlackButton
                          onClick={() => {
                            setSelectedDay(day.value);
                            setOpenCopyDayModal(true);
                          }}
                          text="Copiar día"
                          wfit={true}
                          textSmall={true}
                        />

                        <BlackButton
                          onClick={() => {
                            setSelectedDay(day.value);
                            setOpenCreateModal(true);
                          }}
                          text="+ Nueva clase"
                          wfit={true}
                          textSmall={true}
                        />
                      </div>
                    )}

                    {classesOfDay.length > 0 ? (
                      <div className="grid gap-3">
                        {classesOfDay.map((classTemplate) => (
                          <div
                            key={classTemplate.id}
                            onClick={() => setSelectedClass(classTemplate)}
                            className="rounded-lg border border-gray-400 bg-[#EFECF0] p-4 cursor-pointer leading-tight"
                          >
                            <div className="flex justify-between">
                              <div>
                                <h3 className="font-semibold mb-1">
                                  {classTemplate.activityName}
                                </h3>

                                <p className="text-gray-500">
                                  {classTemplate.professorName}{" "}
                                  {classTemplate.professorSurname}
                                </p>
                              </div>

                              <div className="text-right">
                                <p className="font-semibold">
                                  {classTemplate.startTime.slice(0, 5)} -{" "}
                                  {classTemplate.endTime.slice(0, 5)}
                                </p>

                                <p className="text-gray-500 mt-1">
                                  {classTemplate.students.length}/
                                  {classTemplate.maxCapacity} alumnos
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-6">
                        No hay clases configuradas para este día.
                      </p>
                    )}
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
          isTemplate={true}
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
    </div>
  );
}
