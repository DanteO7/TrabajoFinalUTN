import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { changeEmailSchema } from "../../schema/change-email-schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../../store/auth-store";
import { sendRegisterCode } from "../../services/auth";
import { changeEmail } from "../../services/user";
import Modal from "../modals/modal";
import { X } from "lucide-react";
import ErrorModal from "../modals/error-modal";
import SuccessModal from "../modals/success-modal";
import BlackButton from "../buttons/black-button";
import FormInput from "../inputs/form-input";
import { useTranslation } from "react-i18next";

export default function ChangeEmailForm({ user, close }) {
  const { t } = useTranslation();
  const { login } = useAuthStore();
  const queryClient = useQueryClient();

  const [backendError, setBackendError] = useState();
  const [errorModal, setErrorModal] = useState(false);
  const [succesModal, setSuccesModal] = useState(false);
  const [succesMessage, setSuccessMessage] = useState();
  const [codeSent, setCodeSent] = useState(false);
  const [seconds, setSeconds] = useState(0);

  const {
    register,
    getValues,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(changeEmailSchema),
    mode: "onTouched",
  });

  // Timer para countdown
  useEffect(() => {
    if (seconds > 0) {
      const interval = setInterval(() => {
        setSeconds((s) => s - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [seconds]);

  const mutation = useMutation({
    mutationKey: ["changeEmail", user?.id],
    mutationFn: changeEmail,
    onSuccess: (data) => {
      setSuccessMessage(t("profile.emailChanged"));
      setSuccesModal(true);
      setBackendError(null);
      login(data);
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setTimeout(() => {
        close();
      }, 2000);
    },
    onError: (error) => {
      const data = error?.response?.data;
      let msg = t("profile.errorSendingEmail");
      if (typeof data === "string") msg = data;
      else if (data?.errors)
        msg = Object.values(data.errors).flat().join(" - ");
      else if (data?.title) msg = data.title;
      setBackendError(msg);
      setErrorModal(true);
    },
  });

  const handleSendCode = async () => {
    const email = getValues("newEmail");

    if (!email) {
      setBackendError(t("profile.enterEmail"));
      setErrorModal(true);
      return;
    }

    try {
      await sendRegisterCode({ email, purpose: "ChangeEmail" });
      setCodeSent(true);
      setSeconds(60);
    } catch (error) {
      const data = error?.response?.data;
      let msg = t("profile.sendCodeError");
      if (typeof data === "string") msg = data;
      else if (data?.message) msg = data.message;
      setBackendError(msg);
      setErrorModal(true);
    }
  };

  const onSubmit = (data) => {
    setBackendError(null);
    mutation.mutate({ id: user.id, data });
  };

  return (
    <Modal open={true} onClose={close}>
      <button
        onClick={close}
        className="absolute top-4 right-4 text-gray-500 hover:text-black transition duration-200 cursor-pointer"
      >
        <X size={20} />
      </button>

      <h2 className="text-2xl font-semibold mb-4 text-center">
        {t("profile.changeEmail")}
      </h2>
      <form
        noValidate
        className="flex max-w flex-col gap-3.5"
        onSubmit={handleSubmit(onSubmit)}
      >
        <p className="text-gray-400 text-[15px]">
          {t("profile.changeEmailDescription")}
        </p>
        <FormInput
          label={t("profile.newEmail")}
          id="newEmail"
          type="email"
          placeholder={t("profile.newEmailPlaceholder")}
          register={register("newEmail")}
          error={errors.newEmail}
          disabled={isSubmitting || mutation.isPending}
        />
        {codeSent && (
          <div>
            <FormInput
              id="verificationCode"
              type="text"
              placeholder={t("profile.verificationCode")}
              register={register("verificationCode")}
              error={errors.verificationCode}
            />
          </div>
        )}
        <BlackButton
          type="button"
          onClick={handleSendCode}
          disabled={seconds > 0}
          text={
            seconds > 0
              ? t("profile.resendIn", { seconds })
              : t("profile.sendCode")
          }
          textSmall
        />

        {codeSent && (
          <BlackButton
            type="submit"
            disabled={isSubmitting || mutation.isPending || !codeSent}
            text={
              mutation.isPending
                ? t("profile.changingEmail")
                : t("profile.changeEmail")
            }
            textSmall={true}
          />
        )}
      </form>
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
    </Modal>
  );
}
