import { useState } from "react";
import MainLayout from "../../layouts/main-layout";
import { useQuery } from "@tanstack/react-query";
import { getStudents } from "../../services/student";
import { useLocation } from "wouter";
import { IoArrowBack } from "react-icons/io5";
import Loading from "../../components/loading";
import LinkModal from "../../components/modals/link-modal";
import StudentModal from "../../components/students/student-modal";
import BlackButton from "../../components/buttons/black-button";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import SearchInput from "../../components/inputs/search-input";
import { useHasPermission } from "../../store/tenant-store";
import { useTranslation } from "react-i18next";
import CreateStudentModal from "../../components/students/create-student-modal";

export default function Students({ tenantId }) {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();

  const isSmallScreen = useMediaQuery("(min-width: 900px)");

  const canReadInvitations = useHasPermission(tenantId, "INVITATION_READ");

  const [openModal, setOpenModal] = useState(false);
  const [openCreateModal, setOpenCreateModal] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [inputValue, setInputValue] = useState("");

  const {
    data: students = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["getStudents", tenantId],
    queryFn: () => getStudents({ tenantId }),
  });

  const filteredStudents = students.filter((student) => {
    const search = inputValue.toLowerCase();

    const fullName = `${student.name} ${student.surname}`.toLowerCase();

    return (
      fullName.includes(search) ||
      student.user?.email.toLowerCase().includes(search)
    );
  });

  const getStatusLabel = (status) => {
    switch (status) {
      case "Paid":
        return t("tenants.monthlyFeeStatuses.paid");
      case "Pending":
        return t("tenants.monthlyFeeStatuses.pending");
      case "Overdue":
        return t("tenants.monthlyFeeStatuses.overdue");
      default:
        return status;
    }
  };

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
                {t("tenantPages.students.title")}
              </h1>

              <p className="text-gray-500 mt-3">
                {t("tenantPages.students.description")}
              </p>
            </div>

            {students.length > 0 && (
              <div className="flex flex-col sm:flex-row justify-between gap-4 mt-10">
                <SearchInput
                  value={inputValue}
                  onChange={setInputValue}
                  placeholder={t("tenantPages.students.search")}
                />

                {canReadInvitations && (
                  <div className="grid grid-cols-2 min-[900px]:flex min-[900px]:justify-end items-center gap-2 w-full">
                    <BlackButton
                      text={t("tenantPages.students.invite")}
                      onClick={() => setOpenModal(true)}
                      textSmall={true}
                      wfit={isSmallScreen}
                    />
                    <BlackButton
                      text={t("tenantPages.students.create")}
                      onClick={() => setOpenCreateModal(true)}
                      textSmall={true}
                      wfit={isSmallScreen}
                    />
                  </div>
                )}
              </div>
            )}

            <div className="grid gap-6 mt-8 sm:grid-cols-2 xl:grid-cols-3">
              {students.length > 0 ? (
                filteredStudents.map((student) => (
                  <div
                    key={student.id}
                    onClick={() => setSelectedStudent(student)}
                    className="cursor-pointer rounded-lg border bg-[#efecf0] border-gray-400 p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition] duration-300"
                  >
                    <h3 className="font-semibold text-xl">
                      {student.name} {student.surname}
                    </h3>

                    <p className="text-gray-500 mt-2 text-[14px]">
                      {student.user?.email}
                    </p>

                    <div className="mt-4 flex justify-between items-center">
                      <span className="text-sm font-medium">
                        {student.studentPlan.name}
                      </span>

                      <span
                        className={`text-xs rounded-full px-3 py-1
                        ${
                          student.monthlyFeeStatus === "Paid"
                            ? "bg-green-100 text-green-700"
                            : student.monthlyFeeStatus === "Pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {getStatusLabel(student.monthlyFeeStatus)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-20 border border-gray-400 rounded-lg text-center">
                  <h3 className="text-xl font-semibold">
                    {t("tenantPages.students.emptyTitle")}
                  </h3>

                  <p className="text-gray-500 px-2 mt-2 mb-6">
                    {t("tenantPages.students.invitePrompt")}
                  </p>

                  {canReadInvitations && (
                    <div>
                      <BlackButton
                        text={t("tenantPages.students.invite")}
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
              <LinkModal
                tenantId={tenantId}
                close={() => setOpenModal(false)}
                role="Student"
              />
            )}

            {openCreateModal && (
              <CreateStudentModal
                tenantId={tenantId}
                close={() => setOpenCreateModal(false)}
              />
            )}

            {selectedStudent && (
              <StudentModal
                key={selectedStudent.id}
                tenantId={tenantId}
                student={selectedStudent}
                close={() => setSelectedStudent(null)}
              />
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}
