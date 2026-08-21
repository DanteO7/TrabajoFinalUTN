import React, { useState } from "react";
import MainLayout from "../../layouts/main-layout";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { IoArrowBack } from "react-icons/io5";
import { getActivities } from "../../services/activity";
import Loading from "../../components/loading";
import ActivityForm from "../../components/activities/activity-form";
import ActivityModal from "../../components/activities/activity-modal";
import { useTenantStore } from "../../store/tenant-store";
import BlackButton from "../../components/buttons/black-button";

export default function Activities({ tenantId }) {
  const [, setLocation] = useLocation();

  const [search, setSearch] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);

  const userRoles = useTenantStore(
    (state) => state.userRolesInTenant[tenantId],
  );
  const isTenant = userRoles?.roles?.includes("Tenant");

  const {
    data: activities = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["getActivities", tenantId],
    queryFn: () => getActivities(tenantId),
  });

  const filteredActivities = activities.filter((activity) => {
    return (
      activity.name.toLowerCase().includes(search.toLowerCase()) ||
      (activity.description &&
        activity.description.toLowerCase().includes(search.toLowerCase()))
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
                Actividades
              </h1>

              <p className="text-gray-500 mt-3">
                Desde acá podés administrar todas las actividades del negocio.
              </p>
            </div>

            {activities.length > 0 && (
              <div className="flex flex-col sm:flex-row justify-between gap-4 mt-10">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar actividad..."
                  className="w-full sm:max-w-md rounded-xl border px-4 py-2 bg-[#efefef]"
                />

                {isTenant && (
                  <div className="justify-self-end">
                    <BlackButton
                      text="+ Nueva actividad"
                      onClick={() => setOpenForm(true)}
                      textSmall={true}
                      wfit={true}
                    />
                  </div>
                )}
              </div>
            )}

            <div className="grid gap-6 mt-8 sm:grid-cols-2 xl:grid-cols-3">
              {activities.length > 0 ? (
                filteredActivities.map((activity) => (
                  <div
                    key={activity.id}
                    onClick={() => setSelectedActivity(activity)}
                    className="cursor-pointer rounded-xl border p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                  >
                    <h3 className="font-semibold text-xl">{activity.name}</h3>

                    {activity.description && (
                      <p className="text-gray-500 mt-2 line-clamp-2">
                        {activity.description}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-20 border rounded-xl text-center">
                  <h3 className="text-xl font-semibold">No hay actividades</h3>

                  <p className="text-gray-500 px-2 mt-2 mb-6">
                    Creá tu primera actividad para comenzar.
                  </p>

                  {isTenant && (
                    <div className="flex items-center justify-center">
                      <BlackButton
                        text="+ Crear actividad"
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
              <ActivityForm
                tenantId={tenantId}
                close={() => setOpenForm(false)}
              />
            )}

            {selectedActivity && (
              <ActivityModal
                tenantId={tenantId}
                activity={selectedActivity}
                close={() => setSelectedActivity(null)}
              />
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}
