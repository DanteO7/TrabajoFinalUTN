import React, { useState } from "react";
import MainLayout from "../../layouts/main-layout";
import { useQuery } from "@tanstack/react-query";
import { getSpecialities } from "../../services/speciality";
import { useLocation } from "wouter";
import { IoArrowBack } from "react-icons/io5";
import SpecialityForm from "../../components/specialities/speciality-form";
import SpecialityModal from "../../components/specialities/speciality-modal";
import Loading from "../../components/loading";

export default function Specialities({ tenantId }) {
  const [, setLocation] = useLocation();

  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [selectedSpeciality, setSelectedSpeciality] = useState(null);

  const { data: specialities = [], isLoading } = useQuery({
    queryKey: ["getSpecialities", tenantId],
    queryFn: () => getSpecialities(tenantId),
  });

  const filteredSpecialities = specialities.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()),
  );

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
                Especialidades
              </h1>

              <p className="text-gray-500 mt-3">
                Desde acá podés administrar todas las especialidades de tus
                profesores.
              </p>
            </div>

            {specialities.length > 0 && (
              <div className="flex flex-col sm:flex-row justify-between gap-4 mt-10">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar especialidad..."
                  className="w-full sm:max-w-md rounded-xl border px-4 py-2 bg-[#efefef]"
                />

                <button
                  onClick={() => setOpenModal(true)}
                  className="bg-[#333] text-white px-5 py-2 rounded-xl hover:bg-gray-700 transition cursor-pointer"
                >
                  + Nueva especialidad
                </button>
              </div>
            )}

            <div className="grid gap-6 mt-8 sm:grid-cols-2 xl:grid-cols-3">
              {specialities.length > 0 ? (
                filteredSpecialities.map((speciality) => (
                  <div
                    key={speciality.id}
                    onClick={() => setSelectedSpeciality(speciality)}
                    className="cursor-pointer rounded-xl border p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                  >
                    <h3 className="font-semibold text-xl">{speciality.name}</h3>
                  </div>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-20 border rounded-xl text-center">
                  <h3 className="text-xl font-semibold">
                    Todavía no hay especialidades
                  </h3>

                  <p className="text-gray-500 mt-2 mb-6">
                    Creá tu primera especialidad para comenzar.
                  </p>

                  <button
                    onClick={() => setOpenModal(true)}
                    className="bg-[#333] text-white px-5 py-2 rounded-xl hover:bg-gray-700 transition cursor-pointer"
                  >
                    + Crear especialidad
                  </button>
                </div>
              )}
            </div>

            {openModal && (
              <SpecialityForm
                tenantId={tenantId}
                close={() => setOpenModal(false)}
              />
            )}

            {selectedSpeciality && (
              <SpecialityModal
                speciality={selectedSpeciality}
                tenantId={tenantId}
                close={() => setSelectedSpeciality(null)}
              />
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}
