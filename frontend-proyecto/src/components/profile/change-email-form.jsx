import React from "react";
import FormInput from "../form-input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { changeEmailSchema } from "../../schema/change-email-schema";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useAuthStore } from "../../store/auth-store";
import { sendRegisterCode } from "../../services/auth";
import { changeEmail } from "../../services/user";
import Modal from "../modals/modal";
import { X } from "lucide-react";
import ErrorModal from "../modals/error-modal";
import SuccessModal from "../modals/success-modal";

export default function ChangeEmailForm({ user, close }) {
  const { login } = useAuthStore();

  const [backendError, setBackendError] = useState();
  const [errorModal, setErrorModal] = useState(false);
  const [succesModal, setSuccesModal] = useState(false);
  const [succesMessage, setSuccessMessage] = useState();
  const [codeSent, setCodeSent] = useState(false);

  const {
    register,
    getValues,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(changeEmailSchema),
    mode: "onTouched",
  });

  const mutation = useMutation({
    mutationKey: ["changeEmail", user?.id],
    mutationFn: changeEmail,
    onSuccess: (data) => {
      setSuccessMessage("Perfil actualizado correctamente");
      setSuccesModal(true);
      setBackendError(null);
      login(data);
      setTimeout(() => {
        close();
      }, 3000);
    },
    onError: (error) => {
      const data = error?.response?.data;
      let msg = "Ocurrió un error al iniciar sesión";
      if (typeof data === "string") msg = data;
      else if (data?.errors)
        msg = Object.values(data.errors).flat().join(" - ");
      else if (data?.title) msg = data.title;
      setBackendError(msg);
      setErrorModal(true);
    },
  });

  const handleSendCode = async () => {
    const email = getValues("email");

    if (!email) {
      setBackendError("Ingresa un email");
      setErrorModal(true);
      return;
    }

    try {
      sendRegisterCode({
        email: getValues("email"),
      });
      setCodeSent(true);
    } catch (error) {
      setBackendError(`Error enviando código: ${error}`);
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
        <button type="button" onClick={handleSendCode}>
          Enviar código
        </button>
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
          type="submit"
          disabled={isSubmitting || mutation.isPending}
          className="text-[#efefef] bg-[#333] rounded-[13px] px-3 py-2 w-full cursor-pointer border-[1.7px] border-[#333] hover:bg-gray-300 hover:text-[#333] hover:border-gray-400 transition duration-300"
        >
          {mutation.isPending ? "Cambiando..." : "Cambiar email"}
        </button>
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
