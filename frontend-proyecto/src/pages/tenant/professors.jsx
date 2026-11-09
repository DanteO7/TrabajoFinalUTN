import { useState } from "react";
import MainLayout from "../../layouts/main-layout";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { IoArrowBack } from "react-icons/io5";
import { getProfessors } from "../../services/professor";
import Loading from "../../components/loading";
import LinkModal from "../../components/modals/link-modal";
import ProfessorModal from "../../components/professors/professor-modal";
import { useHasPermission } from "../../store/tenant-store";
import BlackButton from "../../components/buttons/black-button";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import SearchInput from "../../components/inputs/search-input";
import { useTranslation } from "react-i18next";

export default function Professors({ tenantId }) {
  const { t } = useTranslation();
  const isSmallScreen = useMediaQuery("(min-width: 900px)");

  const canCreateInvitation = useHasPermission(tenantId, "INVITATION_CREATE");
  const canReadInvitations = useHasPermission(tenantId, "INVITATION_READ");

  const [, setLocation] = useLocation();
  const [inputValue, setInputValue] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [selectedProfessor, setSelectedProfessor] = useState(null);

  const {
    data: professors = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["getProfessors", tenantId],
    queryFn: () => getProfessors(tenantId),
  });

  const filteredProfessors = professors.filter((professor) => {
    const fullName =
      `${professor.user.name} ${professor.user.surname}`.toLowerCase();

    return (
      fullName.includes(inputValue.toLowerCase()) ||
      professor.user.email.toLowerCase().includes(inputValue.toLowerCase())
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
                {t("tenantPages.professors.title")}
              </h1>

              <p className="text-gray-500 mt-3">
                {t("tenantPages.professors.description")}
              </p>
            </div>

            {professors.length > 0 && (
              <div className="flex flex-col sm:flex-row justify-between gap-4 mt-10">
                <SearchInput
                  value={inputValue}
                  onChange={setInputValue}
                  placeholder={t("tenantPages.professors.search")}
                />

                {canReadInvitations && (
                  <BlackButton
                    text={t("tenantPages.professors.invite")}
                    onClick={() => setOpenModal(true)}
                    textSmall={true}
                    wfit={isSmallScreen}
                  />
                )}
              </div>
            )}

            <div className="grid gap-6 mt-8 sm:grid-cols-2 xl:grid-cols-3">
              {professors.length > 0 ? (
                filteredProfessors.map((professor) => (
                  <div
                    key={professor.id}
                    onClick={() => setSelectedProfessor(professor)}
                    className="cursor-pointer rounded-lg border border-gray-400 bg-[#EFECF0] p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition] duration-300"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-xl">
                        {professor.user.name} {professor.user.surname}
                      </h3>

                      <span
                        className={`text-xs rounded-full px-2 py-1 font-medium ${
                          professor.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {professor.isActive
                          ? t("tenantPages.active")
                          : t("tenantPages.inactive")}
                      </span>
                    </div>

                    <p className="text-gray-500 mt-2">{professor.user.email}</p>

                    {professor.specialities.length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs text-gray-600 mb-2">
                          {t("tenantPages.professors.specialities")}:
                        </p>

                        <div className="flex flex-wrap gap-1">
                          {professor.specialities.map((spec) => (
                            <span
                              key={spec.specialityId}
                              className="bg-[#333] text-white text-xs rounded-full px-2 py-1"
                            >
                              {spec.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-20 border border-gray-400 rounded-lg text-center">
                  <h3 className="text-xl font-semibold">
                    {t("tenantPages.professors.emptyTitle")}
                  </h3>

                  {canCreateInvitation ? (
                    <>
                      <p className="text-gray-500 px-2 mt-2 mb-6">
                        {t("tenantPages.professors.invitePrompt")}
                      </p>

                      {canReadInvitations && (
                        <div className="flex items-center justify-center">
                          <BlackButton
                            text={t("tenantPages.professors.invite")}
                            onClick={() => setOpenModal(true)}
                            textSmall={true}
                            wfit={true}
                          />
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-500 px-2 mt-2 mb-6">
                      {t("tenantPages.professors.noProfessors")}
                    </p>
                  )}
                </div>
              )}
            </div>

            {openModal && (
              <LinkModal
                tenantId={tenantId}
                close={() => setOpenModal(false)}
                role="Professor"
              />
            )}

            {selectedProfessor && (
              <ProfessorModal
                key={selectedProfessor.id}
                tenantId={tenantId}
                professor={selectedProfessor}
                close={() => setSelectedProfessor(null)}
              />
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}
