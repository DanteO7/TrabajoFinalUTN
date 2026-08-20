import { IoArrowBack } from "react-icons/io5";
import MainLayout from "../../layouts/main-layout";
import { useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getNews, markNewsAsRead } from "../../services/news";
import Loading from "../../components/loading";
import BlackButton from "../../components/buttons/black-button";
import { useTenantStore } from "../../store/tenant-store";
import { useState } from "react";
import NewsForm from "../../components/news/news-form";
import NewsModal from "../../components/news/news-modal";

export default function News({ tenantId }) {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const [openCreateModal, setOpenCreateModal] = useState();

  const [selectedNews, setSelectedNews] = useState(null);

  const {
    data: news = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["news", tenantId],
    queryFn: () => getNews(tenantId),
  });

  const markMutation = useMutation({
    mutationFn: (novedadId) => markNewsAsRead(novedadId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["news", tenantId],
      });
      queryClient.invalidateQueries({
        queryKey: ["unreadCount", tenantId],
      });
    },
  });

  const userRoles = useTenantStore(
    (state) => state.userRolesInTenant[tenantId],
  );
  const canCreateNews =
    userRoles?.roles?.includes("Tenant") || userRoles?.roles?.includes("Admin");

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
        ) : isError ? (
          <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-700">
            Esta página no existe o no tienes acceso.
          </div>
        ) : (
          <>
            <div>
              <h1 className="text-4xl min-[900px]:text-5xl font-bold">
                Novedades
              </h1>

              <div className="grid min-[900px]:grid-cols-2 gap-4">
                <p className="text-gray-500 mt-3">
                  {canCreateNews ? (
                    <>
                      Comparte anuncios y novedades de tu negocio. Los alumnos
                      recibirán notificaciones y verán un contador de mensajes
                      sin leer.
                    </>
                  ) : (
                    <>
                      Aquí encontrarás todas las novedades y anuncios
                      importantes de tu negocio. No te pierdas ninguna
                      actualización.
                    </>
                  )}
                </p>
                {canCreateNews && (
                  <div className="h-fit min-[900px]:justify-self-end">
                    <BlackButton
                      text="+ Nueva Noticia"
                      onClick={() => setOpenCreateModal(true)}
                      textSmall={true}
                      wfit={true}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-6 mt-8 sm:grid-cols-2 xl:grid-cols-3">
              {news.length > 0 ? (
                news.map((novedad) => (
                  <div
                    key={novedad.id}
                    onClick={() => {
                      setSelectedNews(novedad);
                      if (!novedad.isRead) markMutation.mutate(novedad.id);
                    }}
                    className={`cursor-pointer rounded-xl border p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${
                      !novedad.isRead && "bg-red-100"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{novedad.title}</h3>
                        <p className="text-gray-600 text-sm mt-1">
                          {novedad.content}
                        </p>
                      </div>
                      {!novedad.isRead && (
                        <span className="w-2 h-2 bg-red-[#fc697b] rounded-full"></span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(novedad.createdAt).toLocaleDateString("es-AR")}
                    </p>
                  </div>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-20 border rounded-xl text-center">
                  <h3 className="text-xl font-semibold">
                    Todavía no hay noticias
                  </h3>
                  {canCreateNews ? (
                    <>
                      <p className="text-gray-500 mt-2 mb-6">
                        Creá noticias para avisar a tus alumnos.
                      </p>
                      <div className="flex items-center justify-center">
                        <BlackButton
                          text="+ Crear Noticia"
                          onClick={() => setOpenCreateModal(true)}
                          textSmall={true}
                          wfit={true}
                        />
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-500 mt-2 mb-6">
                      Todavia no hay noticias subidas.
                    </p>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
      {openCreateModal && (
        <NewsForm tenantId={tenantId} close={() => setOpenCreateModal(false)} />
      )}
      {selectedNews && (
        <NewsModal
          news={selectedNews}
          tenantId={tenantId}
          close={() => setSelectedNews(null)}
          canCreateNews={canCreateNews}
        />
      )}
    </MainLayout>
  );
}
