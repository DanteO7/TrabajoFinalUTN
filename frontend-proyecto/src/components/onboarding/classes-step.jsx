import { useState } from "react";
import { getClassTemplates } from "../../services/class-template";
import { useQuery } from "@tanstack/react-query";
import { hasOfficialClasses } from "../../services/class";
import Loading from "../loading";
import BlackButton from "../buttons/black-button";
import ClassForm from "../classes/class-form";
import CopyClassTemplateDayModal from "../class-template/copy-class-template-day-modal";
import CopyClassTemplateWeekModal from "../class-template/copy-class-template-week-modal";
import ClassCard from "../classes/class-card";

const days = [
  { value: 1, label: "Lunes" },
  { value: 2, label: "Martes" },
  { value: 3, label: "Miércoles" },
  { value: 4, label: "Jueves" },
  { value: 5, label: "Viernes" },
  { value: 6, label: "Sábado" },
  { value: 0, label: "Domingo" },
];

export default function ClassesStep({ tenantId, isComplete }) {
  const [openDay, setOpenDay] = useState(null);

  const [openTemplateForm, setOpenTemplateForm] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);

  const [openIndividualForm, setOpenIndividualForm] = useState(false);

  const [openCopyDayModal, setOpenCopyDayModal] = useState(false);
  const [openCopyWeekModal, setOpenCopyWeekModal] = useState(false);

  const {
    data: classTemplates = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["getClassTemplates", tenantId],
    queryFn: getClassTemplates,
    enabled: !!tenantId && !isComplete,
  });

  const {
    isLoading: isLoadingOfficialClasses,
    isError: isOfficialClassesError,
    refetch: refetchOfficialClasses,
  } = useQuery({
    queryKey: ["getClasses", tenantId, "exists"],
    queryFn: () => hasOfficialClasses(tenantId),
    enabled: !!tenantId,
  });

  if (isLoading || isLoadingOfficialClasses) {
    return <Loading />;
  }

  if (isError || isOfficialClassesError) {
    return (
      <div className="mt-6">
        <p className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">
          No se pudieron cargar las clases. Intentá nuevamente.
        </p>
        <button
          type="button"
          onClick={() => {
            refetch();
            refetchOfficialClasses();
          }}
          className="mt-3 underline"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="mt-6 flex flex-col gap-8">
      <p className="text-gray-600">
        {isComplete
          ? "¡Bien! Ya tenés una clase en el calendario. Seguimos con lo siguiente."
          : "Configurá al menos una clase en el calendario oficial. Podés crearla directamente o copiar tu semana modelo."}
      </p>

      {!isComplete && (
        <>
          <section>
            <h3 className="text-lg font-semibold">
              1. Configurá tu semana modelo
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Organizá las clases que se repiten habitualmente. Desplegá cada
              día para consultar sus clases y agregar nuevas.
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Más adelante vas a poder editar o eliminar tus clases y modificar
              la organización de tus actividades cuando lo necesites. Esta
              configuración inicial es solo para ayudarte a empezar.
            </p>

            <div className="mt-4 flex flex-col gap-3">
              <div className="mt-4">
                <BlackButton
                  text="Copiar semana"
                  wfit
                  textSmall
                  onClick={() => setOpenCopyWeekModal(true)}
                  disabled={classTemplates.length === 0}
                />
              </div>
              {days.map((day) => {
                const classesOfDay = classTemplates.filter(
                  (template) => template.dayOfWeek === day.value,
                );

                const isOpen = openDay === day.value;

                return (
                  <div
                    key={day.value}
                    className="overflow-hidden rounded-lg border border-gray-400 shadow-md"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenDay(isOpen ? null : day.value)}
                      className="flex w-full cursor-pointer items-center justify-between bg-[#EFECF0] px-5 py-4 transition"
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
                        <div className="border-t border-gray-400 p-4">
                          <div className="mb-4 flex flex-wrap justify-end gap-3">
                            <BlackButton
                              onClick={() => {
                                setSelectedDay(day.value);
                                setOpenTemplateForm(true);
                              }}
                              text="+ Nueva clase"
                              wfit
                              textSmall
                            />

                            {classesOfDay.length > 0 && (
                              <BlackButton
                                onClick={() => {
                                  setSelectedDay(day.value);
                                  setOpenCopyDayModal(true);
                                }}
                                text="Copiar día"
                                wfit
                                textSmall
                              />
                            )}
                          </div>
                          {classesOfDay.length > 0 ? (
                            <div className="mb-4 grid gap-3">
                              {classesOfDay.map((template) => (
                                <ClassCard
                                  key={template.id}
                                  classItem={{
                                    ...template,
                                    activityName:
                                      template.activity?.name ??
                                      template.activityName ??
                                      "Clase configurada",
                                    professorName:
                                      template.professor?.user?.name ??
                                      template.professorName ??
                                      "",
                                    professorSurname:
                                      template.professor?.user?.surname ??
                                      template.professorSurname ??
                                      "",
                                    reservationsCount: 0,
                                    students: [],
                                  }}
                                  isSelected={false}
                                  canSelect={false}
                                />
                              ))}
                            </div>
                          ) : (
                            <p className="py-6 text-center text-gray-500">
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
          </section>

          <section className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold">
              2. Creá una clase individual
            </h3>

            <p className="mt-2 text-sm text-gray-600">
              También podés crear una clase para una fecha específica sin
              configurar una semana modelo.
            </p>

            <div className="mt-4">
              <BlackButton
                text="Crear clase individual"
                onClick={() => setOpenIndividualForm(true)}
                wfit
                textSmall
              />
            </div>
          </section>
        </>
      )}

      {openTemplateForm && (
        <ClassForm
          key={`template-${selectedDay}`}
          tenantId={tenantId}
          defaultDayOfWeek={selectedDay}
          close={() => setOpenTemplateForm(false)}
          isTemplate
        />
      )}

      {openIndividualForm && (
        <ClassForm
          key="individual-class"
          tenantId={tenantId}
          close={() => setOpenIndividualForm(false)}
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
