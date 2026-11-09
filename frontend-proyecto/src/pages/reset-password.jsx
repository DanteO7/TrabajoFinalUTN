import MainLayout from "../layouts/main-layout";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { changePasswordSchema } from "../schema/change-password-schema";
import { useMutation } from "@tanstack/react-query";
import { changePassword } from "../services/user";
import { useState } from "react";
import { useSearchParams } from "wouter";
import ErrorModal from "../components/modals/error-modal";
import SuccessModal from "../components/modals/success-modal";
import { useLocation } from "wouter";
import FormInput from "../components/inputs/form-input";
import BlackButton from "../components/buttons/black-button";
import { useTranslation } from "react-i18next";

export default function ResetPassword() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();

  const [backendError, setBackendError] = useState();
  const [errorModal, setErrorModal] = useState(false);
  const [succesModal, setSuccesModal] = useState(false);
  const [succesMessage, setSuccessMessage] = useState();

  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
    mode: "onTouched",
  });

  const mutation = useMutation({
    mutationKey: ["changePassword"],
    mutationFn: changePassword,
    onSuccess: () => {
      setSuccessMessage(t("auth.passwordChanged"));
      setSuccesModal(true);
      setBackendError(null);
      setTimeout(() => {
        setLocation("/");
      }, 3000);
    },
    onError: (error) => {
      const data = error?.response?.data;
      let msg = t("auth.passwordChangeError");
      if (typeof data === "string") msg = data;
      else if (data?.errors)
        msg = Object.values(data.errors).flat().join(" - ");
      else if (data?.title) msg = data.title;
      setBackendError(msg);
      setErrorModal(true);
    },
  });

  const onSubmit = (passwords) => {
    setBackendError(null);
    const data = { ...passwords, token };

    mutation.mutate({
      data: data,
    });
  };

  return (
    <MainLayout>
      <div className="mt-15 lg:w-[25%]">
        <h2 className="text-[32px] font-semibold mb-10 lg:text-center">
          {t("auth.changePassword")}
        </h2>
        <form
          noValidate
          className="flex max-w flex-col gap-6 mt-4"
          onSubmit={handleSubmit(onSubmit)}
        >
          <FormInput
            label={t("auth.newPassword")}
            id="newPassword"
            type="password"
            placeholder={t("auth.newPasswordPlaceholder")}
            register={register("newPassword")}
            error={errors.newPassword}
            disabled={isSubmitting || mutation.isPending}
            isPassword
          />
          <FormInput
            label={t("auth.confirmPassword")}
            id="confirmNewPassword"
            type="password"
            placeholder={t("auth.newPasswordPlaceholder")}
            register={register("confirmNewPassword")}
            error={errors.confirmNewPassword}
            disabled={isSubmitting || mutation.isPending}
            isPassword
          />

          <BlackButton
            disabled={mutation.isPending}
            type="submit"
            text={mutation.isPending ? t("auth.changingPassword") : t("auth.changePassword")}
            textSmall
          />
        </form>
      </div>
      {errorModal && (
        <ErrorModal
          close={() => setErrorModal(false)}
          message={backendError}
          isSuccesOrError={true}
        />
      )}
      {succesModal && (
        <SuccessModal
          close={() => setSuccesModal(false)}
          message={succesMessage}
          isSuccesOrError={true}
        />
      )}
    </MainLayout>
  );
}
