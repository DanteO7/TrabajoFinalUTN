import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getActivities } from "../../services/activity";
import BlackButton from "../buttons/black-button";
import Loading from "../loading";
import ActivityForm from "../activities/activity-form";

export default function ActivitiesStep({ tenantId, isComplete }) {
  const [openForm, setOpenForm] = useState(false);

  const { isLoading, isError, refetch } = useQuery({
    queryKey: ["getActivities", tenantId],
    queryFn: () => getActivities(tenantId),
    enabled: !!tenantId,
  });

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return (
      <div className="mt-6">
        <p className="text-red-600" role="alert">
          No se pudieron cargar las actividades.
        </p>

        <button
          type="button"
          onClick={() => refetch()}
          className="mt-3 underline"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="mt-6 flex flex-col gap-5">
      <p className="text-gray-600">
        {isComplete
          ? "Listo, ya tenés tus actividades configuradas. Podés continuar."
          : "Las actividades representan los servicios que ofrece tu negocio, como Pilates, Yoga o Entrenamiento funcional."}
      </p>
      {!isComplete && (
        <BlackButton
          text="Crear actividad"
          onClick={() => setOpenForm(true)}
          wfit
          textSmall
        />
      )}

      {openForm && (
        <ActivityForm tenantId={tenantId} close={() => setOpenForm(false)} />
      )}
    </div>
  );
}
