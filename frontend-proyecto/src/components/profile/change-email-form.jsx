import React, { useState, useEffect } from "react";
import FormInput from "../form-input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { changeEmailSchema } from "../../schema/change-email-schema";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "../../store/auth-store";
import { sendRegisterCode } from "../../services/auth";
import { changeEmail } from "../../services/user";
import Modal from "../modals/modal";
import { X } from "lucide-react";
import ErrorModal from "../modals/error-modal";
import SuccessModal from "../modals/success-modal";
import BlackButton from "../buttons/black-button";
import WhiteButton from "../buttons/white-button";

export default function ChangeEmailForm({ user, close }) {
  const { login } = useAuthStore();

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
      setSuccessMessage("Email cambiado correctamente");
      setSuccesModal(true);
      setBackendError(null);
      login(data);
      setTimeout(() => {
        close();
      }, 2000);
    },
    onError: (error) => {
      const data = error?.response?.data;
      let msg = "Ocurrió un error";
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
      setBackendError("Ingresa un email");
      setErrorModal(true);
      return;
    }

    try {
      await sendRegisterCode({ email });
      setCodeSent(true);
      setSeconds(60);
    } catch (error) {
      const data = error?.response?.data;
      let msg = "Error al enviar código";
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

      <h2 className="text-2xl font-semibold mb-4 text-center">Cambiar Email</h2>
      <form
        noValidate
        className="flex max-w flex-col gap-3.5"
        onSubmit={handleSubmit(onSubmit)}
      >
        <p className="text-gray-400 text-[15px]">
          Ingresa tu nuevo correo electrónico. Te enviaremos un código de
          verificación para confirmar que te pertenece.
        </p>
        <FormInput
          label="Nuevo Email"
          id="newEmail"
          type="email"
          placeholder="nuevoemail@example.com..."
          register={register("newEmail")}
          error={errors.newEmail}
          disabled={isSubmitting || mutation.isPending}
        />
        {codeSent && (
          <div>
            <FormInput
              id="verificationCode"
              type="text"
              placeholder="Código de verificación"
              register={register("verificationCode")}
              error={errors.verificationCode}
            />
          </div>
        )}
        <button
          type="button"
          onClick={handleSendCode}
          disabled={seconds > 0}
          className={`rounded-[13px] px-3 py-1.5 border-[1.7px] border-[#333] transition-all duration-300 ${
            seconds > 0
              ? "bg-gray-400 text-gray-200 cursor-not-allowed"
              : "hover:bg-gray-300 hover:text-[#333] cursor-pointer text-[#333]"
          }`}
        >
          {seconds > 0 ? `Reenviar en ${seconds}s` : "Enviar código"}
        </button>

        {codeSent && (
          <BlackButton
            type="submit"
            disabled={isSubmitting || mutation.isPending || !codeSent}
            text={mutation.isPending ? "Cambiando..." : "Cambiar email"}
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
