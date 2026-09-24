import React, { useState } from "react";
import MainLayout from "../../layouts/main-layout";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { IoArrowBack } from "react-icons/io5";
import { getProfessors } from "../../services/professor";
import Loading from "../../components/loading";
import LinkModal from "../../components/modals/link-modal";
import ProfessorModal from "../../components/professors/professor-modal";
import { useTenantStore } from "../../store/tenant-store";
import BlackButton from "../../components/buttons/black-button";
import { X } from "lucide-react";
import { Search } from "lucide-react";
import { useMediaQuery } from "../../hooks/useMediaQuery";

export default function Professors({ tenantId }) {
  const hasPermission = useTenantStore((state) => state.hasPermission);

  const isSmallScreen = useMediaQuery("(min-width: 900px)");

  const canCreateInvitation = hasPermission(tenantId, "INVITATION_CREATE");

  const [, setLocation] = useLocation();
  const [inputValue, setInputValue] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [selectedProfessor, setSelectedProfessor] = useState(null);

  const {
    data: professors = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["getProfessors", tenantId],
    queryFn: () => getProfessors(tenantId),
  });

  const filteredProfessors = professors.filter((professor) => {
    const fullName =
      `${professor.user.name} ${professor.user.surname}`.toLowerCase();

    return (
      fullName.includes(inputValue.toLowerCase()) ||
      professor.user.email.toLowerCase().includes(inputValue.toLowerCase())
    );
  });

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
                Profesores
              </h1>

              <p className="text-gray-500 mt-3">
                Desde acá podés administrar todos los profesores del negocio.
              </p>
            </div>

            {professors.length > 0 && (
              <div className="flex flex-col sm:flex-row justify-between gap-4 mt-10">
                <div className="relative w-full sm:max-w-md">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Buscar alumno..."
                    className="w-full rounded-xl border px-10 py-2 bg-[#efefef] outline-none focus:ring-2 focus:ring-[#333]"
                  />

                  {inputValue && (
                    <X
                      size={18}
                      onClick={() => setInputValue("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black cursor-pointer"
                    />
                  )}
                </div>

                <BlackButton
                  text="+ Invitar alumno"
                  onClick={() => setOpenModal(true)}
                  textSmall={true}
                  wfit={isSmallScreen}
                />
              </div>
            )}

            <div className="grid gap-6 mt-8 sm:grid-cols-2 xl:grid-cols-3">
              {professors.length > 0 ? (
                filteredProfessors.map((professor) => (
                  <div
                    key={professor.id}
                    onClick={() => setSelectedProfessor(professor)}
                    className="cursor-pointer rounded-xl border p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-xl">
                        {professor.user.name} {professor.user.surname}
                      </h3>

                      <span
                        className={`text-xs rounded-full px-2 py-1 font-medium ${
                          professor.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {professor.isActive ? "Activo" : "Inactivo"}
                      </span>
                    </div>

                    <p className="text-gray-500 mt-2">{professor.user.email}</p>

                    {professor.specialities.length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs text-gray-600 mb-2">
                          Profesiones:
                        </p>

                        <div className="flex flex-wrap gap-1">
                          {professor.specialities.map((spec) => (
                            <span
                              key={spec.specialityId}
                              className="bg-[#333] text-white text-xs rounded-full px-2 py-1"
                            >
                              {spec.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-20 border rounded-xl text-center">
                  <h3 className="text-xl font-semibold">
                    Todavía no hay profesores
                  </h3>

                  {canCreateInvitation ? (
                    <>
                      <p className="text-gray-500 px-2 mt-2 mb-6">
                        Invitá tu primer profesor para comenzar.
                      </p>

                      <div className="flex items-center justify-center">
                        <BlackButton
                          text="+ Invitar profesor"
                          onClick={() => setOpenModal(true)}
                          textSmall={true}
                          wfit={true}
                        />
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-500 px-2 mt-2 mb-6">
                      Todavía no hay profesores.
                    </p>
                  )}
                </div>
              )}
            </div>

            {openModal && (
              <LinkModal
                tenantId={tenantId}
                close={() => setOpenModal(false)}
                role="Professor"
              />
            )}

            {selectedProfessor && (
              <ProfessorModal
                tenantId={tenantId}
                professor={selectedProfessor}
                close={() => setSelectedProfessor(null)}
              />
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}
