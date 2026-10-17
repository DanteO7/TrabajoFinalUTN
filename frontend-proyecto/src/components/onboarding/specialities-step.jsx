import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getProfessors } from "../../services/professor";
import { getSpecialities } from "../../services/speciality";
import Loading from "../loading";
import BlackButton from "../buttons/black-button";
import SpecialityForm from "../specialities/speciality-form";
import ProfessorModal from "../professors/professor-modal";

export default function SpecialitiesStep({ tenantId, isComplete }) {
  const [openSpecialityForm, setOpenSpecialityForm] = useState(false);
  const [selectedProfessor, setSelectedProfessor] = useState(null);

  const {
    data: professors = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["getProfessors", tenantId],
    queryFn: () => getProfessors(tenantId),
    enabled: !!tenantId,
  });

  const {
    isLoading: isLoadingSpecialities,
    isError: isSpecialitiesError,
    refetch: refetchSpecialities,
  } = useQuery({
    queryKey: ["getSpecialities", tenantId],
    queryFn: () => getSpecialities(tenantId),
    enabled: !!tenantId,
  });

  if (isLoading || isLoadingSpecialities) {
    return <Loading />;
  }

  if (isError || isSpecialitiesError) {
    return (
      <div className="mt-6">
        <p className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">
          No se pudieron cargar los profesores o las profesiones. Intentá
          nuevamente.
        </p>
        <button
          type="button"
          onClick={() => {
            refetch();
            refetchSpecialities();
          }}
          className="mt-3 underline"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <p className="text-gray-600">
        {isComplete
          ? "Listo, ya asignaste una profesión a un profesor."
          : "Creá al menos una profesión y asignásela a un profesor. Después de guardar la actualización, vas a poder continuar con la configuración."}
      </p>

      {!isComplete && (
        <div className="mt-5">
          <BlackButton
            text="Crear profesión"
            onClick={() => setOpenSpecialityForm(true)}
            wfit
            textSmall
          />
        </div>
      )}

      {!isComplete && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold">Profesores</h3>

          {professors.length > 0 ? (
            <div className="mt-4 grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {professors.map((professor) => (
                <button
                  key={professor.id}
                  type="button"
                  onClick={() => setSelectedProfessor(professor)}
                  className="min-h-28 min-w-0 w-full cursor-pointer rounded-lg border border-gray-400 bg-[#EFECF0] p-4 text-left shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 sm:p-6"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="min-w-0 flex-1 wrap-break-word font-semibold text-lg sm:text-xl">
                      {professor.user.name} {professor.user.surname}
                    </h3>

                    <span
                      className={`shrink-0 text-xs rounded-full px-2 py-1 font-medium ${
                        professor.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {professor.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </div>

                  <p className="mt-2 min-w-0 text-[14px] wrap-break-word text-gray-500">
                    {professor.user.email}
                  </p>

                  {professor.specialities.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs text-gray-600 mb-2">Profesiones:</p>

                      <div className="flex flex-wrap gap-1">
                        {professor.specialities.map((speciality) => (
                          <span
                            key={speciality.specialityId}
                            className="max-w-full wrap-break-word whitespace-normal bg-[#333] text-white text-xs rounded-full px-2 py-1"
                          >
                            {speciality.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="mt-4 flex flex-col items-center justify-center py-12 border border-gray-400 rounded-lg text-center">
              <h3 className="text-xl font-semibold">
                Todavía no hay profesores
              </h3>
              <p className="text-gray-500 px-2 mt-2">
                Invitá a un profesor desde el paso anterior para poder asignarle
                profesiones.
              </p>
            </div>
          )}
        </div>
      )}

      {openSpecialityForm && (
        <SpecialityForm
          tenantId={tenantId}
          close={() => setOpenSpecialityForm(false)}
        />
      )}

      {selectedProfessor && (
        <ProfessorModal
          tenantId={tenantId}
          professor={selectedProfessor}
          close={() => setSelectedProfessor(null)}
        />
      )}
    </div>
  );
}
