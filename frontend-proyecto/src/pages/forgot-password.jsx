import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { forgotPassword } from "../services/auth";
import { Link } from "wouter";
import FormInput from "../components/form-input";
import ErrorModal from "../components/modals/error-modal";
import { useForm } from "react-hook-form";
import z from "zod/v3";
import { zodResolver } from "@hookform/resolvers/zod";
import EmailSentModal from "../components/modals/email-sent-modal";
import BlackButton from "../components/buttons/black-button";
import WhiteButton from "../components/buttons/white-button";

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "El email es obligatorio")
    .min(4, "Email es requerido")
    .max(100, "El email no debe tener mas de 100 caracteres")
    .email("Debe ser un email válido")
    .refine((value) => value.includes("@"), "Debe ser un email válido"),
});

export default function ForgotPassword() {
  const [seconds, setSeconds] = useState(0);
  const [errorModal, setErrorModal] = useState(false);
  const [backendError, setBackendError] = useState();
  const [openForgotPassword, setOpenForgotPassword] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onTouched",
  });

  useEffect(() => {
    if (seconds > 0) {
      const interval = setInterval(() => {
        setSeconds((s) => s - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [seconds]);

  const resendMutation = useMutation({
    mutationFn: () => forgotPassword({ email: getValues("email") }),
    onSuccess: () => {
      setSeconds(60);
      setOpenForgotPassword(true);
    },
    onError: (error) => {
      const data = error?.response?.data;
      let msg = "Error al reenviar el código";
      if (typeof data === "string") msg = data;
      else if (data?.errors)
        msg = Object.values(data.errors).flat().join(" - ");
      else if (data?.message) msg = data.message;
      setBackendError(msg);
      setErrorModal(true);
    },
  });

  const onSubmit = () => {
    resendMutation.mutate();
  };

  return (
    <div className="bg-[#ede9ee] min-h-screen text-[11px] flex">
      <div className="hidden min-[900px]:flex w-[60%] bg-gray-800 pt-2">
        <div className="text-center flex flex-col w-full item-center mt-10">
          <h2 className="text-4xl font-bold text-[#efefef]">Turno Fácil</h2>
          <p className="text-gray-400 font-semibold text-2xl">Verificación</p>
          <h3 className="text-gray-300 text-xl mt-2">
            Gestioná todos tus negocios desde un solo lugar
          </h3>
        </div>
      </div>
      <div className="text-black p-5 mt-10 mx-auto min-[900px]:my-auto w-11/12 md:w-1/2 lg:w-[22%]">
        <form
          noValidate
          className="flex flex-col gap-4 text-[14px]"
          onSubmit={handleSubmit(onSubmit)}
        >
          <h2 className="text-center text-2xl font-bold min-[900px]:hidden">
            Turno Fácil
          </h2>

          <p className="text-center text-gray-700 font-semibold text-[17px] min-[900px]:text-2xl">
            Olvidé mi contraseña
          </p>

          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">
              Ingrese el mail para recuperar su contraseña:
            </p>
          </div>

          <div>
            <FormInput
              id="email"
              type="text"
              placeholder="tu@email.com"
              register={register("email")}
              error={errors.email}
            />
          </div>

          <BlackButton
            type="button"
            text={seconds > 0 ? `Reenviar en ${seconds}s` : "Enviar mail"}
            onClick={() => resendMutation.mutate()}
            disabled={seconds > 0 || resendMutation.isPending}
            textSmall={true}
          />

          <Link href="/iniciar-sesion">
            <WhiteButton textSmall={true} text="Volver" />
          </Link>
        </form>
      </div>

      {errorModal && (
        <ErrorModal
          close={() => setErrorModal(false)}
          message={backendError}
          isSuccesOrError={true}
        />
      )}
      {openForgotPassword && (
        <EmailSentModal
          close={() => setOpenForgotPassword(false)}
          email={getValues("email")}
          isSuccesOrError={true}
          sendAgain={onSubmit}
          seconds={seconds}
        />
      )}
    </div>
  );
}
