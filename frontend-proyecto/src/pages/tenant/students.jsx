import React, { useState } from "react";
import MainLayout from "../../layouts/main-layout";
import { useQuery } from "@tanstack/react-query";
import { getStudents } from "../../services/student";
import { useLocation } from "wouter";
import { IoArrowBack } from "react-icons/io5";
import Loading from "../../components/loading";
import LinkModal from "../../components/modals/link-modal";
import StudentModal from "../../components/students/student-modal";
import BlackButton from "../../components/buttons/black-button";
import { useMediaQuery } from "../../hooks/useMediaQuery";

export default function Students({ tenantId }) {
  const [, setLocation] = useLocation();
  const isSmallScreen = useMediaQuery("(min-width: 900px)");

  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const {
    data: students = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["getStudents", tenantId],
    queryFn: () => getStudents({ tenantId }),
  });

  const filteredStudents = students.filter((student) => {
    const fullName =
      `${student.user.name} ${student.user.surname}`.toLowerCase();

    return (
      fullName.includes(search.toLowerCase()) ||
      student.user.email.toLowerCase().includes(search.toLowerCase())
    );
  });

  const getStatusLabel = (status) => {
    switch (status) {
      case "Paid":
        return "Pagado";
      case "Pending":
        return "Pendiente";
      case "Overdue":
        return "Vencido";
      default:
        return status;
    }
  };

  return (
    <MainLayout>
      <div className="w-full max-w-6xl mt-12">
        <button
          onClick={() => setLocation(`/tu-espacio/${tenantId}`)}
          className="text-gray-500 hover:text-black transition flex items-center gap-2 mb-6 cursor-pointer"
        >
          <IoArrowBack color="fc697b" />
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
                Alumnos
              </h1>

              <p className="text-gray-500 mt-3">
                Desde acá podés administrar todos los alumnos del negocio.
              </p>
            </div>

            {students.length > 0 && (
              <div className="flex flex-col sm:flex-row justify-between gap-4 mt-10">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar alumno..."
                  className="w-full sm:max-w-md rounded-xl border px-4 py-2 bg-[#efefef]"
                />
                <BlackButton
                  text="+ Invitar alumno"
                  onClick={() => setOpenModal(true)}
                  textSmall={true}
                  wfit={isSmallScreen}
                />
              </div>
            )}

            <div className="grid gap-6 mt-8 sm:grid-cols-2 xl:grid-cols-3">
              {students.length > 0 ? (
                filteredStudents.map((student) => (
                  <div
                    key={student.id}
                    onClick={() => setSelectedStudent(student)}
                    className="cursor-pointer rounded-xl border p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                  >
                    <h3 className="font-semibold text-xl">
                      {student.user.name} {student.user.surname}
                    </h3>

                    <p className="text-gray-500 mt-2">{student.user.email}</p>

                    <div className="mt-4 flex justify-between items-center">
                      <span className="text-sm font-medium">
                        {student.studentPlan.name}
                      </span>

                      <span
                        className={`text-xs rounded-full px-3 py-1
                        ${
                          student.monthlyFeeStatus === "Paid"
                            ? "bg-green-100 text-green-700"
                            : student.monthlyFeeStatus === "Pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {getStatusLabel(student.monthlyFeeStatus)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-20 border rounded-xl text-center">
                  <h3 className="text-xl  font-semibold">
                    Todavía no hay alumnos
                  </h3>

                  <p className="text-gray-500 px-2 mt-2 mb-6">
                    Invitá tu primer alumno para comenzar.
                  </p>
                  <BlackButton
                    text="+ Invitar alumno"
                    onClick={() => setOpenModal(true)}
                    textSmall={true}
                    wfit={true}
                  />
                </div>
              )}
            </div>

            {openModal && (
              <LinkModal
                tenantId={tenantId}
                close={() => setOpenModal(false)}
                role="Student"
              />
            )}

            {selectedStudent && (
              <StudentModal
                tenantId={tenantId}
                student={selectedStudent}
                close={() => setSelectedStudent(null)}
              />
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}
