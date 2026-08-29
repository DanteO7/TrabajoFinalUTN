import { useState } from "react";

import MainLayout from "../../layouts/main-layout";

import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { IoArrowBack } from "react-icons/io5";

import { getExercises } from "../../services/exercise";

import Loading from "../../components/loading";
import ExerciseForm from "../../components/exercises/exercise-form";
import ExerciseModal from "../../components/exercises/exercise-modal";

import { useTenantStore } from "../../store/tenant-store";

import BlackButton from "../../components/buttons/black-button";

export default function Exercises({ tenantId }) {
  const [, setLocation] = useLocation();

  const [search, setSearch] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);

  const userRoles = useTenantStore(
    (state) => state.userRolesInTenant[tenantId],
  );

  const isTenant = userRoles?.roles?.includes("Tenant");

  const {
    data: exercises = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["getExercises", tenantId],
    queryFn: () => getExercises(tenantId),
  });

  const filteredExercises = exercises.filter((exercise) => {
    return (
      exercise.name.toLowerCase().includes(search.toLowerCase()) ||
      (exercise.description &&
        exercise.description.toLowerCase().includes(search.toLowerCase()))
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
                Ejercicios
              </h1>

              <p className="text-gray-500 mt-3">
                Desde acá podés administrar los ejercicios para las rutinas.
              </p>
            </div>

            {exercises.length > 0 && (
              <div className="flex flex-col sm:flex-row justify-between gap-4 mt-10">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar ejercicio..."
                  className="w-full sm:max-w-md rounded-xl border px-4 py-2 bg-[#efefef]"
                />

                {isTenant && (
                  <div className="justify-self-end">
                    <BlackButton
                      text="+ Nuevo ejercicio"
                      onClick={() => setOpenForm(true)}
                      textSmall={true}
                      wfit={true}
                    />
                  </div>
                )}
              </div>
            )}

            <div className="grid gap-6 mt-8 sm:grid-cols-2 xl:grid-cols-3">
              {exercises.length > 0 ? (
                filteredExercises.length > 0 ? (
                  filteredExercises.map((exercise) => (
                    <div
                      key={exercise.id}
                      onClick={() => setSelectedExercise(exercise)}
                      className="cursor-pointer rounded-xl border p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                    >
                      <h3 className="font-semibold text-xl">{exercise.name}</h3>

                      {exercise.description && (
                        <p className="text-gray-500 mt-2 line-clamp-3">
                          {exercise.description}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center py-20 border rounded-xl text-center">
                    <h3 className="text-xl font-semibold">
                      No se encontraron ejercicios
                    </h3>

                    <p className="text-gray-500 px-2 mt-2">
                      Probá con otro término de búsqueda.
                    </p>
                  </div>
                )
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-20 border rounded-xl text-center">
                  <h3 className="text-xl font-semibold">No hay ejercicios</h3>

                  <p className="text-gray-500 px-2 mt-2 mb-6">
                    Creá tu primer ejercicio para comenzar.
                  </p>

                  {isTenant && (
                    <div className="flex items-center justify-center">
                      <BlackButton
                        text="+ Crear ejercicio"
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
              <ExerciseForm
                tenantId={tenantId}
                close={() => setOpenForm(false)}
              />
            )}

            {selectedExercise && (
              <ExerciseModal
                tenantId={tenantId}
                exercise={selectedExercise}
                close={() => setSelectedExercise(null)}
              />
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}
