import React, { useMemo, useState } from "react";
import MainLayout from "../../layouts/main-layout";
import { useQuery } from "@tanstack/react-query";
import { getClasses } from "../../services/class";
import { IoArrowBack } from "react-icons/io5";
import { useLocation } from "wouter";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import "../../css/day-picker.css";

import ClassForm from "../../components/classes/class-form";
import ClassModal from "../../components/classes/class-modal";
import Loading from "../../components/loading";
import { useTenantStore } from "../../store/tenant-store";
import BlackButton from "../../components/buttons/black-button";

export default function Classes({ tenantId }) {
  const [, setLocation] = useLocation();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [openModal, setOpenModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);

  const formatLocalDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const userRoles = useTenantStore(
    (state) => state.userRolesInTenant[tenantId],
  );
  const canCreateClass =
    userRoles?.roles?.includes("Tenant") || userRoles?.roles?.includes("Admin");

  const {
    data: classes = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["getClasses", tenantId, selectedDate],
    queryFn: () => getClasses(tenantId, formatLocalDate(selectedDate)),
    staleTime: 5 * 60 * 1000,
  });

  const classesOfDay = useMemo(() => {
    return classes.filter((c) => {
      const classDateString = c.date.split("T")[0];
      const selectedDateString = formatLocalDate(selectedDate);
      return classDateString === selectedDateString;
    });
  }, [classes, selectedDate]);

  const isDateInPast = selectedDate < new Date().setHours(0, 0, 0, 0);

  return (
    <MainLayout>
      <div className="w-full max-w-6xl mt-12">
        <button
          onClick={() => setLocation(`/tu-espacio/${tenantId}`)}
          className="text-gray-500 hover:text-black transition flex items-center gap-2 mb-6 cursor-pointer"
        >
          <IoArrowBack />
          Volver
        </button>

        {isLoading ? (
          <Loading />
        ) : isError ? (
          <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-700">
            Esta página no existe o no tienes acceso.
          </div>
        ) : (
          <>
            <div>
              <h1 className="text-4xl min-[900px]:text-5xl font-bold">
                Clases
              </h1>

              <p className="text-gray-500 mt-3">
                Seleccioná un día para visualizar las clases programadas.
              </p>
            </div>

            <div className="flex flex-col xl:flex-row gap-10 mt-10">
              <div className="mx-auto">
                <DayPicker
                  mode="single"
                  selected={selectedDate}
                  defaultMonth={selectedDate}
                  onSelect={(date) => {
                    if (date) setSelectedDate(date);
                  }}
                  formatters={{
                    formatWeekdayName: (date) => {
                      const days = [
                        "Dom",
                        "Lun",
                        "Mar",
                        "Mié",
                        "Jue",
                        "Vie",
                        "Sáb",
                      ];
                      return days[date.getDay()];
                    },
                    formatCaption: (date) => {
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
                      return `${months[date.getMonth()]} ${date.getFullYear()}`;
                    },
                  }}
                  className="border rounded-2xl shadow-md px-4 py-3"
                />
              </div>

              <div className="flex-1">
                <div className="grid grid-cols-2 items-center mb-6">
                  <h2 className="text-2xl font-semibold">
                    Clases del {selectedDate.toLocaleDateString("es-AR")}
                  </h2>

                  {canCreateClass && !isDateInPast && (
                    <div className="justify-self-end">
                      <BlackButton
                        onClick={() => setOpenModal(true)}
                        text="+ Nueva clase"
                        wfit={true}
                        textSmall={true}
                      />
                    </div>
                  )}
                </div>

                <div className="grid gap-5">
                  {classesOfDay.length > 0 ? (
                    classesOfDay.map((classItem) => (
                      <div
                        key={classItem.id}
                        onClick={() => setSelectedClass(classItem)}
                        className="cursor-pointer rounded-xl border p-5 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="text-xl font-semibold">
                              {classItem.activityName}
                            </h3>

                            <p className="text-gray-500 mt-1">
                              {classItem.professor.user.name}{" "}
                              {classItem.professor.user.surname}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="font-semibold">
                              {classItem.startTime.slice(0, 5)} -{" "}
                              {classItem.endTime.slice(0, 5)}
                            </p>

                            <p className="text-gray-500 mt-1">
                              {classItem.reservationsCount}/
                              {classItem.maxCapacity} alumnos
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : isDateInPast ? (
                    canCreateClass ? (
                      <div className="border rounded-xl py-16 text-center">
                        <h3 className="text-xl font-semibold text-red-600">
                          No puedes crear clases para días anteriores
                        </h3>

                        <p className="text-gray-500 mt-2">
                          Seleccioná una fecha futura para crear una nueva
                          clase.
                        </p>
                      </div>
                    ) : (
                      <div className="border rounded-xl py-16 text-center">
                        <h3 className="text-xl font-semibold text-red-600">
                          No hubo clases este dia
                        </h3>

                        <p className="text-gray-500 mt-2">
                          Seleccioná una fecha futura ver las clases disponibles
                        </p>
                      </div>
                    )
                  ) : !canCreateClass ? (
                    <div className="border rounded-xl py-16 text-center">
                      <h3 className="text-xl font-semibold">
                        No hay clases este día
                      </h3>

                      <p className="text-gray-500 mt-2">
                        Esperá a que los profesores creen clases para esta
                        fecha.
                      </p>
                    </div>
                  ) : (
                    <div className="border rounded-xl py-16 text-center flex flex-col items-center">
                      <h3 className="text-xl font-semibold">
                        No hay clases este día
                      </h3>

                      <p className="text-gray-500 mt-2 mb-6">
                        Creá una nueva clase para esta fecha.
                      </p>
                      <BlackButton
                        onClick={() => setOpenModal(true)}
                        text="+ Crear clase"
                        wfit={true}
                        textSmall={true}
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
          </>
        )}
      </div>
    </MainLayout>
  );
}
