import { Link } from "wouter";
import MainLayout from "../layouts/main-layout";
import { useAuthStore } from "../store/auth-store";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ErrorModal from "../components/modals/error-modal";
import Navbar from "../components/navbar";
import { forgotPassword, signOut } from "../services/auth";
import { useLocation } from "wouter";
import ChangeEmailForm from "../components/profile/change-email-form";
import EmailSentModal from "../components/modals/email-sent-modal";
import { useEffect } from "react";
import { useTenantStore } from "../store/tenant-store";
import RedButton from "../components/buttons/red-button";
import WhiteButton from "../components/buttons/white-button";
import BlackButton from "../components/buttons/black-button";
import EditProfileModal from "../components/profile/edit-profile-modal";
import FormInput from "../components/inputs/form-input";
import { useTranslation } from "react-i18next";

export default function Profile() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { user, isAuthenticated, logout } = useAuthStore();

  const [backendError, setBackendError] = useState();
  const [errorModal, setErrorModal] = useState(false);

  const [openEditProfileModal, setOpenEditProfileModal] = useState(false);
  const [openForgotPassword, setOpenForgotPassword] = useState(false);

  const [, setLocation] = useLocation();
  const clearPermissions = useTenantStore((state) => state.clearPermissions);

  const [openChangeEmail, setOpenChangeEmail] = useState(false);

  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (seconds <= 0) return;

    const timer = setInterval(() => {
      setSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds]);

  useEffect(() => {
    if (seconds <= 0) return;

    const interval = setInterval(() => {
      const saved = localStorage.getItem("forgotPasswordCooldown");

      if (!saved) {
        setSeconds(0);
        return;
      }

      const remaining = Math.max(
        0,
        Math.ceil((Number(saved) - Date.now()) / 1000),
      );

      setSeconds(remaining);

      if (remaining <= 0) {
        localStorage.removeItem("forgotPasswordCooldown");
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [seconds]);

  const forgotPasswordMutation = useMutation({
    mutationKey: ["forgot-password"],
    mutationFn: () => forgotPassword({ email: user?.email }),

    onSuccess: () => {
      const endTime = Date.now() + 60_000;

      localStorage.setItem("forgotPasswordCooldown", endTime.toString());

      setSeconds(60);
      setOpenForgotPassword(true);
    },

    onError: (error) => {
      if (error.response?.status === 429) {
        const remaining = error.response.data.remainingSeconds;

        setSeconds(remaining);

        localStorage.setItem(
          "forgotPasswordCooldown",
          (Date.now() + remaining * 1000).toString(),
        );

        return;
      }

      const data = error.response?.data;

      setBackendError(
        typeof data === "string"
          ? data
          : data?.message || t("profile.errorSendingEmail"),
      );

      setErrorModal(true);
    },
  });

  return (
    <MainLayout>
      <div className="mt-16 grid lg:grid-cols-[0.8fr_1fr] w-[90%] min-[900px]:w-[80%] gap-10">
        <Navbar user={user} />

        <div className="w-full lg:max-w-120">
          <h3 className="text-2xl font-semibold">{t("profile.personalData")}</h3>
          {isAuthenticated ? (
            <div className="flex max-w flex-col gap-4 mt-4">
              <FormInput
                label={t("profile.name")}
                id="name"
                type="text"
                value={user?.name || ""}
                disabled={true}
              />

              <FormInput
                label={t("profile.surname")}
                id="surname"
                type="text"
                value={user?.surname || ""}
                disabled={true}
              />

              <FormInput
                label={t("profile.phone")}
                id="phoneNumber"
                type="text"
                placeholder={t("profile.phoneExample")}
                value={user?.phoneNumber || ""}
                disabled={true}
              />

              <div className="flex gap-2">
                <FormInput
                  label={t("profile.age")}
                  id="age"
                  type="number"
                  placeholder={t("profile.ageExample")}
                  value={user?.age || ""}
                  disabled={true}
                />

                <FormInput
                  label={t("profile.weight")}
                  id="weight"
                  type="number"
                  placeholder={t("profile.weightExample")}
                  value={user?.weight || ""}
                  disabled={true}
                />
              </div>
              <FormInput
                label={t("profile.pathologies")}
                id="pathologies"
                value={user?.pathologies || ""}
                disabled={true}
                textarea
                rows={3}
              />
              <BlackButton
                text={t("profile.edit")}
                onClick={() => setOpenEditProfileModal(true)}
                textSmall={true}
                wfit={true}
              />
              <FormInput
                disabled={true}
                label={t("profile.email")}
                id="email"
                type="email"
                value={user?.email || ""}
              />
              <BlackButton
                text={t("profile.changeEmail")}
                onClick={() => setOpenChangeEmail(true)}
                textSmall={true}
                wfit={true}
              />
              <WhiteButton
                disabled={seconds > 0 || forgotPasswordMutation.isPending}
                text={
                  forgotPasswordMutation.isPending
                    ? t("profile.sendingEmail")
                    : seconds > 0
                      ? t("profile.resendIn", { seconds })
                      : t("profile.changePassword")
                }
                onClick={() => forgotPasswordMutation.mutate()}
                textSmall={true}
                wfit={true}
              />
              <RedButton
                text={t("profile.signOut")}
                onClick={async () => {
                  queryClient.clear();
                  clearPermissions();
                  logout();

                  try {
                    await signOut();
                  } catch (error) {
                    console.log("Error en signOut:", error);
                  }
                  setLocation("/");
                }}
                textSmall={true}
                wfit={true}
              />
            </div>
          ) : (
            <div className="flex flex-col mt-5 gap-3">
              <span>{t("profile.signInRequired")}</span>
              <Link href="/iniciar-sesion">
                <BlackButton text={t("auth.signIn")} wfit textSmall />
              </Link>
            </div>
          )}
        </div>
      </div>
      {errorModal && (
        <ErrorModal
          close={() => setErrorModal(false)}
          message={backendError}
          isSuccesOrError={true}
        />
      )}
      {openChangeEmail && (
        <ChangeEmailForm user={user} close={() => setOpenChangeEmail(false)} />
      )}
      {openForgotPassword && (
        <EmailSentModal
          close={() => setOpenForgotPassword(false)}
          email={user.email}
          isSuccesOrError={true}
          sendAgain={() => forgotPasswordMutation.mutate()}
          seconds={seconds}
        />
      )}
      {openEditProfileModal && (
        <EditProfileModal close={() => setOpenEditProfileModal(false)} />
      )}
    </MainLayout>
  );
}
