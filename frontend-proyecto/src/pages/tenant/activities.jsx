import { useState } from "react";
import MainLayout from "../../layouts/main-layout";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { IoArrowBack } from "react-icons/io5";
import { getActivities } from "../../services/activity";
import Loading from "../../components/loading";
import ActivityForm from "../../components/activities/activity-form";
import ActivityModal from "../../components/activities/activity-modal";
import { useHasPermission } from "../../store/tenant-store";
import BlackButton from "../../components/buttons/black-button";
import SearchInput from "../../components/inputs/search-input";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { useTranslation } from "react-i18next";

export default function Activities({ tenantId }) {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const isSmallScreen = useMediaQuery("(min-width: 900px)");

  const [inputValue, setInputValue] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);

  const canCreateActivity = useHasPermission(tenantId, "ACTIVITY_CREATE");

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
      activity.name.toLowerCase().includes(inputValue.toLowerCase()) ||
      (activity.description &&
        activity.description.toLowerCase().includes(inputValue.toLowerCase()))
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
                {t("tenantPages.activities.title")}
              </h1>

              <p className="text-gray-500 mt-3">
                {t("tenantPages.activities.description")}
              </p>
            </div>

            {activities.length > 0 && (
              <div className="flex flex-col sm:flex-row justify-between gap-4 mt-10">
                <SearchInput
                  value={inputValue}
                  onChange={setInputValue}
                  placeholder={t("tenantPages.activities.search")}
                />

                {canCreateActivity && (
                  <div className="justify-self-end">
                    <BlackButton
                      text={t("tenantPages.activities.new")}
                      onClick={() => setOpenForm(true)}
                      textSmall={true}
                      wfit={isSmallScreen}
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
                    className="bg-[#efecf0] cursor-pointer rounded-lg border border-gray-400 p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition] duration-300"
                  >
                    <h3 className="font-semibold text-xl">{activity.name}</h3>

                    <p className="text-gray-500 mt-2 line-clamp-3">
                      {activity.description ||
                        t("tenantPages.noDescription")}
                    </p>
                  </div>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-20 border border-gray-400 rounded-lg text-center">
                  <h3 className="text-xl font-semibold">
                    {t("tenantPages.activities.emptyTitle")}
                  </h3>

                  <p className="text-gray-500 px-2 mt-2 mb-6">
                    {t("tenantPages.activities.emptyDescription")}
                  </p>

                  {canCreateActivity && (
                    <div className="flex items-center justify-center">
                      <BlackButton
                        text={t("tenantPages.activities.create")}
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
                key={selectedActivity.id}
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
