import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { IoArrowBack } from "react-icons/io5";
import MainLayout from "../../layouts/main-layout";
import Loading from "../../components/loading";
import { getProfessors } from "../../services/professor";
import ProfessorPermissionsModal from "../../components/professors/professor-permissions-modal";
import SuccessModal from "../../components/modals/success-modal";
import { useTranslation } from "react-i18next";

export default function Permissions({ tenantId }) {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [selectedProfessor, setSelectedProfessor] = useState(null);
  const [successModal, setSuccessModal] = useState(false);

  useEffect(() => {
    if (!successModal) return undefined;

    const timeoutId = setTimeout(() => setSuccessModal(false), 2000);
    return () => clearTimeout(timeoutId);
  }, [successModal]);

  const {
    data: professors = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["getProfessors", tenantId],
    queryFn: () => getProfessors(tenantId),
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

        <h1 className="text-4xl min-[900px]:text-5xl font-bold">
          {t("tenantPages.permissions.title")}
        </h1>
        <p className="text-gray-500 mt-3">
          {t("tenantPages.permissions.description")}
        </p>

        {isLoading ? (
          <div className="mt-8">
            <Loading />
          </div>
        ) : isError ? (
          <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-700 mt-8">
            {error?.response?.data?.message ||
              error?.response?.data ||
              t("tenantPages.permissions.loadError")}
          </div>
        ) : professors.length === 0 ? (
          <div className="mt-8 rounded-lg border border-gray-400 p-8 text-center">
            <h2 className="text-xl font-semibold">
              {t("tenantPages.professors.emptyTitle")}
            </h2>
            <p className="text-gray-500 mt-2">
              {t("tenantPages.permissions.emptyDescription")}
            </p>
          </div>
        ) : (
          <div className="grid gap-5 mt-8 sm:grid-cols-2 xl:grid-cols-3">
            {professors.map((professor) => (
              <button
                type="button"
                key={professor.id}
                onClick={() => setSelectedProfessor(professor)}
                className="text-left cursor-pointer rounded-lg border border-gray-400 bg-[#EFECF0] p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition] duration-300"
              >
                <h2 className="font-semibold text-xl">
                  {professor.user.name} {professor.user.surname}
                </h2>
                <p className="text-gray-500 mt-2">{professor.user.email}</p>
                <span
                  className={`inline-flex mt-4 rounded-full px-3 py-1 text-sm ${
                    professor.isActive
                      ? "bg-[#a1f3be] text-green-700"
                      : "bg-red-300 text-red-600"
                  }`}
                >
                  {professor.isActive
                    ? t("tenantPages.active")
                    : t("tenantPages.inactive")}
                </span>
                <span className="sr-only">
                  {t("tenantPages.permissions.manage")}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedProfessor && (
        <ProfessorPermissionsModal
          tenantId={tenantId}
          professor={selectedProfessor}
          close={() => setSelectedProfessor(null)}
          onSaved={() => {
            setSelectedProfessor(null);
            setSuccessModal(true);
          }}
        />
      )}
      {successModal && (
        <SuccessModal
          close={() => setSuccessModal(false)}
          message={t("tenantPages.permissions.updateSuccess")}
          isSuccesOrError
        />
      )}
    </MainLayout>
  );
}
