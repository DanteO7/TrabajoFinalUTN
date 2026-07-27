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

export default function Classes({ tenantId }) {
  const [, setLocation] = useLocation();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [openModal, setOpenModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);

  const { data: classes = [], isLoading } = useQuery({
    queryKey: ["getClasses", tenantId, selectedDate],
    queryFn: () =>
      getClasses(tenantId, selectedDate.toISOString().split("T")[0]),
    staleTime: 5 * 60 * 1000,
  });

  const classesOfDay = useMemo(() => {
    return classes.filter((c) => {
      const classDate = new Date(c.date);

      return (
        classDate.getFullYear() === selectedDate.getFullYear() &&
        classDate.getMonth() === selectedDate.getMonth() &&
        classDate.getDate() === selectedDate.getDate()
      );
    });
  }, [classes, selectedDate]);

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
                  }}
                  className="border rounded-2xl shadow-md px-4 py-3"
                />
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold">
                    Clases del {selectedDate.toLocaleDateString("es-AR")}
                  </h2>

                  <button
                    onClick={() => setOpenModal(true)}
                    className="bg-[#333] text-white px-5 py-2 rounded-xl hover:bg-gray-700 transition cursor-pointer"
                  >
                    + Nueva clase
                  </button>
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
                              {classItem.activity.name}
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
                  ) : (
                    <div className="border rounded-xl py-16 text-center">
                      <h3 className="text-xl font-semibold">
                        No hay clases este día
                      </h3>

                      <p className="text-gray-500 mt-2 mb-6">
                        Creá una nueva clase para esta fecha.
                      </p>

                      <button
                        onClick={() => setOpenModal(true)}
                        className="bg-[#333] text-white px-5 py-2 rounded-xl hover:bg-gray-700 transition cursor-pointer"
                      >
                        + Crear clase
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {openModal && (
              <ClassForm
                tenantId={tenantId}
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
