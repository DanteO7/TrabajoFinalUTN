import React, { useState } from "react";
import MainLayout from "../../layouts/main-layout";
import { useQuery } from "@tanstack/react-query";
import { getActivities } from "../../services/activity";
import { useLocation } from "wouter";
import { IoArrowBack } from "react-icons/io5";
import { Link } from "wouter";
import ActivityForm from "../../components/activities/activity-form";
import ActivityModal from "../../components/activities/activity-modal";

export default function Activities({ tenantId }) {
  const [, setLocation] = useLocation();

  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ["getActivities", tenantId],
    queryFn: () => getActivities(tenantId),
  });

  const filteredActivities = activities.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()),
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
          <p>Cargando...</p>
        ) : (
          <>
            <div>
              <h1 className="text-4xl min-[900px]:text-5xl font-bold">
                Actividades
              </h1>

              <p className="text-gray-500 mt-3">
                Desde acá podés administrar todas las actividades que se darán
                en tu negocio.
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

                <button
                  onClick={() => setOpenModal(true)}
                  className="bg-[#333] text-white px-5 py-2 rounded-xl hover:bg-gray-700 transition cursor-pointer"
                >
                  + Nueva actividad
                </button>
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
                  </div>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-20 border rounded-xl text-center">
                  <h3 className="text-xl font-semibold">
                    Todavía no hay actividades
                  </h3>

                  <p className="text-gray-500 mt-2 mb-6">
                    Creá tu primera actividad para comenzar.
                  </p>

                  <button
                    onClick={() => setOpenModal(true)}
                    className="bg-[#333] text-white px-5 py-2 rounded-xl hover:bg-gray-700 transition cursor-pointer"
                  >
                    + Crear actividad
                  </button>
                </div>
              )}
            </div>

            {openModal && (
              <ActivityForm
                tenantId={tenantId}
                close={() => setOpenModal(false)}
              />
            )}
            {selectedActivity && (
              <ActivityModal
                activity={selectedActivity}
                tenantId={tenantId}
                close={() => setSelectedActivity(null)}
              />
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}
