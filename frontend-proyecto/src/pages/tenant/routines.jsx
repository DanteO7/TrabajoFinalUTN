import React, { useState } from "react";

import MainLayout from "../../layouts/main-layout";

import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { IoArrowBack } from "react-icons/io5";

import { getRoutines } from "../../services/routine";

import Loading from "../../components/loading";
import RoutineForm from "../../components/routines/routine-form";
import RoutineModal from "../../components/routines/routine-modal";

import { useTenantStore } from "../../store/tenant-store";

import BlackButton from "../../components/buttons/black-button";

export default function Routines({ tenantId }) {
  const [, setLocation] = useLocation();

  const [search, setSearch] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [selectedRoutine, setSelectedRoutine] = useState(null);

  const userRoles = useTenantStore(
    (state) => state.userRolesInTenant[tenantId],
  );

  const isTenant = userRoles?.roles?.includes("Tenant");

  const {
    data: routines = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["getRoutines", tenantId],
    queryFn: () => getRoutines(tenantId),
  });

  const filteredRoutines = routines.filter((routine) => {
    return (
      routine.name.toLowerCase().includes(search.toLowerCase()) ||
      (routine.description &&
        routine.description.toLowerCase().includes(search.toLowerCase()))
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
                Rutinas
              </h1>

              <p className="text-gray-500 mt-3">
                Desde acá podés administrar las rutinas de entrenamiento del
                negocio.
              </p>
            </div>

            {routines.length > 0 && (
              <div className="flex flex-col sm:flex-row justify-between gap-4 mt-10">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar rutina..."
                  className="w-full sm:max-w-md rounded-xl border px-4 py-2 bg-[#efefef]"
                />

                {isTenant && (
                  <div className="justify-self-end">
                    <BlackButton
                      text="+ Nueva rutina"
                      onClick={() => setOpenForm(true)}
                      textSmall={true}
                      wfit={true}
                    />
                  </div>
                )}
              </div>
            )}

            <div className="grid gap-6 mt-8 sm:grid-cols-2 xl:grid-cols-3">
              {routines.length > 0 ? (
                filteredRoutines.length > 0 ? (
                  filteredRoutines.map((routine) => (
                    <div
                      key={routine.id}
                      onClick={() => setSelectedRoutine(routine)}
                      className="cursor-pointer rounded-xl border p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                    >
                      <h3 className="font-semibold text-xl">{routine.name}</h3>

                      {routine.description && (
                        <p className="text-gray-500 mt-2 line-clamp-2">
                          {routine.description}
                        </p>
                      )}

                      <p className="text-sm text-gray-400 mt-4">
                        {routine.exercises?.length || 0}{" "}
                        {routine.exercises?.length === 1
                          ? "ejercicio"
                          : "ejercicios"}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center py-20 border rounded-xl text-center">
                    <h3 className="text-xl font-semibold">
                      No se encontraron rutinas
                    </h3>

                    <p className="text-gray-500 px-2 mt-2">
                      Probá con otro término de búsqueda.
                    </p>
                  </div>
                )
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-20 border rounded-xl text-center">
                  <h3 className="text-xl font-semibold">No hay rutinas</h3>

                  <p className="text-gray-500 px-2 mt-2 mb-6">
                    Creá tu primera rutina para comenzar.
                  </p>

                  {isTenant && (
                    <div className="flex items-center justify-center">
                      <BlackButton
                        text="+ Crear rutina"
                        onClick={() => setOpenForm(true)}
                        textSmall={true}
                        wfit={true}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {openForm && (
              <RoutineForm
                tenantId={tenantId}
                close={() => setOpenForm(false)}
              />
            )}

            {selectedRoutine && (
              <RoutineModal
                tenantId={tenantId}
                routine={selectedRoutine}
                close={() => setSelectedRoutine(null)}
              />
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}
