import { useState } from "react";
import MainLayout from "../../layouts/main-layout";
import { useQuery } from "@tanstack/react-query";
import { getSpecialities } from "../../services/speciality";
import { useLocation } from "wouter";
import { IoArrowBack } from "react-icons/io5";
import SpecialityForm from "../../components/specialities/speciality-form";
import SpecialityModal from "../../components/specialities/speciality-modal";
import Loading from "../../components/loading";
import BlackButton from "../../components/buttons/black-button";
import SearchInput from "../../components/inputs/search-input";
import { useHasPermission } from "../../store/tenant-store";
import { useTranslation } from "react-i18next";

export default function Specialities({ tenantId }) {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();

  const [inputValue, setInputValue] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [selectedSpeciality, setSelectedSpeciality] = useState(null);
  const canCreateSpecialities = useHasPermission(tenantId, "SPECIALITY_CREATE");

  const {
    data: specialities = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["getSpecialities", tenantId],
    queryFn: () => getSpecialities(tenantId),
  });

  const filteredSpecialities = specialities.filter((s) =>
    s.name.toLowerCase().includes(inputValue.toLowerCase()),
  );

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
                {t("tenantPages.specialities.title")}
              </h1>

              <p className="text-gray-500 mt-3">
                {t("tenantPages.specialities.description")}
              </p>
            </div>

            {specialities.length > 0 && (
              <div className="flex flex-col sm:flex-row justify-between gap-4 mt-10">
                <SearchInput
                  value={inputValue}
                  onChange={setInputValue}
                  placeholder={t("tenantPages.specialities.search")}
                />
                {canCreateSpecialities && (
                  <div className="justify-self-end">
                    <BlackButton
                      text={t("tenantPages.specialities.new")}
                      onClick={() => setOpenModal(true)}
                      textSmall={true}
                      wfit={true}
                    />
                  </div>
                )}
              </div>
            )}

            <div className="grid gap-6 mt-8 sm:grid-cols-2 xl:grid-cols-3">
              {specialities.length > 0 ? (
                filteredSpecialities.map((speciality) => (
                  <div
                    key={speciality.id}
                    onClick={() => setSelectedSpeciality(speciality)}
                    className="cursor-pointer rounded-lg border bg-[#efecf0] border-gray-400 bg p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition] duration-300"
                  >
                    <h3 className="font-semibold text-xl">{speciality.name}</h3>
                  </div>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-20 border border-gray-400 rounded-lg text-center">
                  <h3 className="text-xl font-semibold">
                    {t("tenantPages.specialities.emptyTitle")}
                  </h3>

                  <p className="text-gray-500 mt-2 mb-6">
                    {t("tenantPages.specialities.emptyDescription")}
                  </p>
                  {canCreateSpecialities && (
                    <div className="flex items-center justify-center">
                      <BlackButton
                        text={t("tenantPages.specialities.create")}
                        onClick={() => setOpenModal(true)}
                        textSmall={true}
                        wfit={true}
                      />
                    </div>
                  )}
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
                key={selectedSpeciality.id}
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
