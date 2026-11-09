import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { formatCurrency, getLocale } from "../utils/formatting";
import MainLayout from "../layouts/main-layout";
import { useLocation } from "wouter";
import { getInvitationInfo, acceptInvitation } from "../services/invitation";
import ErrorModal from "../components/modals/error-modal";
import SuccessModal from "../components/modals/success-modal";
import Loading from "../components/loading";
import { getStudentPlans } from "../services/student-plan";
import BlackButton from "../components/buttons/black-button";
import WhiteButton from "../components/buttons/white-button";
import { useTranslation } from "react-i18next";
import { formatNumber } from "../utils/formatting";

export default function Invitation({ token }) {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [backendError, setBackendError] = useState();
  const [errorModal, setErrorModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState();
  const [successModal, setSuccessModal] = useState(false);

  // Obtener información de la invitación
  const { data: invitation, isLoading: invitationLoading } = useQuery({
    queryKey: ["getInvitationInfo", token],
    queryFn: () => getInvitationInfo(token),
  });

  // Obtener planes si es estudiante
  const { data: plans = [], isLoading: plansLoading } = useQuery({
    queryKey: ["getStudentPlans", invitation?.tenantId],
    queryFn: () => getStudentPlans(invitation?.tenantId),
    enabled: invitation?.role === "Student",
  });

  const mutation = useMutation({
    mutationFn: () =>
      acceptInvitation(token, {
        studentPlanId: invitation?.role === "Student" ? selectedPlan : null,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myTenants"] });
      setSuccessMessage(t("invitation.success"));
      setSuccessModal(true);

      setTimeout(() => {
        setLocation("/mi-espacio");
      }, 3000);
    },

    onError: (error) => {
      const data = error?.response?.data;

      let msg = t("invitation.error");

      if (typeof data === "string") msg = data;
      else if (data?.errors)
        msg = Object.values(data.errors).flat().join(" - ");
      else if (data?.message) msg = data.message;

      setBackendError(msg);
      setErrorModal(true);
    },
  });

  const handleAccept = () => {
    if (invitation?.role === "Student" && !selectedPlan) {
      setBackendError(t("invitation.selectPlanError"));
      setErrorModal(true);
      return;
    }

    mutation.mutate();
  };

  if (invitationLoading) {
    return (
      <MainLayout>
        <Loading />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="w-full max-w-md mx-auto mt-20">
        <div className="border border-gray-400 rounded-lg shadow-lg p-8 bg-[#EFECF0]">
          <h1 className="text-3xl font-bold text-center mb-2">
            {t("invitation.title")}
          </h1>

          <p className="text-gray-500 text-center mb-8">
            {t("invitation.description")}
          </p>

          <div className="space-y-6">
            <div className="bg-[#f4f0f5] rounded-lg border border-gray-400 shadow-md p-4">
              <p className="text-sm text-gray-600 mb-2">
                {t("invitation.business")}
              </p>
              <h2 className="text-2xl font-bold text-[#333]">
                {invitation?.tenantName}
              </h2>
            </div>

            <div className="bg-[#f4f0f5] rounded-lg border border-gray-400 shadow-md p-4">
              <p className="text-sm text-gray-600 mb-2">
                {t("invitation.role")}
              </p>
              <p className="text-lg font-semibold text-[#333]">
                {invitation?.role === "Student"
                  ? t("invitation.student")
                  : t("invitation.professor")}
              </p>
            </div>

            <div className="bg-[#f4f0f5] rounded-lg border border-gray-400 shadow-md p-4">
              <p className="text-sm text-gray-600 mb-2">
                {t("invitation.validUntil")}
              </p>
              <p className="text-lg font-semibold text-[#333]">
                {new Date(invitation?.expirationDate).toLocaleDateString(
                  getLocale(),
                )}
              </p>
            </div>

            {invitation?.role === "Student" && (
              <div>
                <label className="block text-sm font-semibold mb-3">
                  {t("invitation.selectPlan")}
                </label>

                {plansLoading ? (
                  <p className="text-gray-500">
                    {t("invitation.loadingPlans")}
                  </p>
                ) : plans.length > 0 ? (
                  <div className="space-y-2">
                    {plans.map((plan) => {
                      const isSelected = String(selectedPlan) === String(plan.id);

                      return (
                        <div
                          key={plan.id}
                          onClick={() => setSelectedPlan(plan.id)}
                          className={`p-4 rounded-lg border cursor-pointer transition ${
                            isSelected
                              ? "border-black border-2 bg-[#F4F0F5]"
                              : "border-gray-400 hover:border-gray-600"
                          }`}
                        >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-[#333]">
                              {plan.name}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {t("invitation.classesPerMonth", {
                                count: formatNumber(plan.classesPerMonth),
                              })}
                            </p>
                          </div>
                          <p className="font-bold text-[#333]">
                            {formatCurrency(plan.price)}
                          </p>
                        </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500">{t("invitation.noPlans")}</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <BlackButton
                text={
                  mutation.isPending
                    ? t("invitation.accepting")
                    : t("invitation.accept")
                }
                textSmall
                onClick={handleAccept}
                disabled={mutation.isPending}
              />
              <WhiteButton
                text={t("invitation.cancel")}
                textSmall
                onClick={() => setLocation("/")}
              />
            </div>
          </div>
        </div>
      </div>

      {errorModal && (
        <ErrorModal
          close={() => setErrorModal(false)}
          message={backendError}
          isSuccesOrError={true}
        />
      )}

      {successModal && (
        <SuccessModal
          close={() => setSuccessModal(false)}
          message={successMessage}
          isSuccesOrError={true}
        />
      )}
    </MainLayout>
  );
}
