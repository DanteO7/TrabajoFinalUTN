import { useState } from "react";
import MainLayout from "../../layouts/main-layout";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { IoArrowBack } from "react-icons/io5";
import { getRoutines } from "../../services/routine";
import Loading from "../../components/loading";
import RoutineForm from "../../components/routines/routine-form";
import RoutineModal from "../../components/routines/routine-modal";
import { useHasPermission } from "../../store/tenant-store";
import BlackButton from "../../components/buttons/black-button";
import SearchInput from "../../components/inputs/search-input";
import { useTranslation } from "react-i18next";
import { formatNumber } from "../../utils/formatting";

export default function Routines({ tenantId }) {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [inputValue, setInputValue] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [selectedRoutine, setSelectedRoutine] = useState(null);

  const canCreateRoutine = useHasPermission(tenantId, "ROUTINE_CREATE");

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
      routine.name.toLowerCase().includes(inputValue.toLowerCase()) ||
      (routine.description &&
        routine.description.toLowerCase().includes(inputValue.toLowerCase()))
    );
  });

  return (
    <MainLayout>
      <div className="w-full max-w-6xl mt-12">
        <button
          onClick={() => setLocation(`/mi-espacio/${tenantId}`)}
          className="text-gray-500 hover:text-black transition flex items-center gap-2 mb-6 cursor-pointer"
        >
          <IoArrowBack color="#fc697b" />
          {t("common.back")}
        </button>

        {isLoading ? (
          <Loading />
        ) : isError ? (
          <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">
            {t("tenantPages.accessError")}
          </div>
        ) : (
          <>
            <div>
              <h1 className="text-4xl min-[900px]:text-5xl font-bold">
                {t("tenantPages.routines.title")}
              </h1>

              <p className="text-gray-500 mt-3">
                {t("tenantPages.routines.description")}
              </p>
            </div>

            {routines.length > 0 && (
              <div className="flex flex-col sm:flex-row justify-between gap-4 mt-10">
                <SearchInput
                  value={inputValue}
                  onChange={setInputValue}
                  placeholder={t("tenantPages.routines.search")}
                />

                {canCreateRoutine && (
                  <div className="justify-self-end">
                    <BlackButton
                      text={t("tenantPages.routines.new")}
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
                      className="cursor-pointer rounded-lg border border-gray-400 bg-[#efecf0] p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition] duration-300"
                    >
                      <h3 className="font-semibold text-xl">{routine.name}</h3>

                      {routine.description && (
                        <p className="text-gray-500 mt-2 line-clamp-2">
                          {routine.description}
                        </p>
                      )}

                      <p className="text-sm text-gray-400 mt-4">
                        {formatNumber(routine.exercises?.length || 0)}{" "}
                        {routine.exercises?.length === 1
                          ? t("tenantPages.routines.exerciseCount_one")
                          : t("tenantPages.routines.exerciseCount_other")}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center py-20 border border-gray-400 rounded-lg text-center">
                    <h3 className="text-xl font-semibold">
                      {t("tenantPages.routines.noSearchResults")}
                    </h3>

                    <p className="text-gray-500 px-2 mt-2">
                      {t("tenantPages.searchHint")}
                    </p>
                  </div>
                )
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-20 border border-gray-400 rounded-lg text-center">
                  <h3 className="text-xl font-semibold">
                    {t("tenantPages.routines.emptyTitle")}
                  </h3>

                  <p className="text-gray-500 px-2 mt-2 mb-6">
                    {t("tenantPages.routines.emptyDescription")}
                  </p>

                  {canCreateRoutine && (
                    <div className="flex items-center justify-center">
                      <BlackButton
                        text={t("tenantPages.routines.create")}
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
                key={selectedRoutine.id}
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
