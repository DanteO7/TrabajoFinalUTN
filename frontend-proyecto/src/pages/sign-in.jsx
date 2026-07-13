import { Link, useLocation } from "wouter";
import FormInput from "../components/form-input";
import { useForm } from "react-hook-form";
import { useAuthStore } from "../store/auth-store";
import { forgotPassword, signIn } from "../services/auth";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { signInSchema } from "../schema/auth-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import ErrorModal from "../components/modals/error-modal";
import EmailSentModal from "../components/modals/email-sent-modal";

export default function SignIn() {
  const { login } = useAuthStore();
  const [, setLocation] = useLocation();
  const [backendError, setBackendError] = useState();
  const [errorModal, setErrorModal] = useState(false);
  const [openForgotPassword, setOpenForgotPassword] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signInSchema),
    mode: "onTouched",
  });

  const mutation = useMutation({
    mutationKey: ["signin"],
    mutationFn: signIn,
    onSuccess: (data) => {
      login(data);
      setLocation("/");
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

  const onSubmit = (credentials) => {
    setBackendError(null);
    mutation.mutate(credentials);
  };

  const handleForgotPassword = async () => {
    try {
      const isValid = await trigger("email");

      if (!isValid) return;

      const email = getValues("email");

      await forgotPassword({
        email,
      });

      setOpenForgotPassword(true);
    } catch (error) {
      setBackendError(`Error enviando email: ${error.message}`);
      setErrorModal(true);
    }
  };

  return (
    <div className="bg-[#ede9ee] h-screen text-[11px] flex">
      <div className="hidden min-[900px]:flex w-[60%] pt-2 bg-gray-800 flex-col">
        <div className="text-center flex flex-col w-full item-center mt-10">
          <h2 className="text-4xl font-bold text-[#efefef]">Turno Fácil</h2>
          <p className=" text-gray-400 font-semibold text-2xl">
            Iniciar sesión
          </p>
          <h3 className="text-gray-300 text-xl mt-2">
            Gestioná todos tus negocios desde un solo lugar
          </h3>
        </div>
      </div>
      <div className="text-black p-5 m-auto w-11/12 md:w-1/2 lg:w-1/4">
        <form
          noValidate
          className="flex max-w flex-col gap-3.5"
          onSubmit={handleSubmit(onSubmit)}
        >
          <h2 className="text-center text-2xl font-bold min-[900px]:hidden">
            Turno Fácil
          </h2>
          <p className="text-center font-semibold text-gray-700 text-[17px]">
            Iniciar sesión
          </p>
          <div>
            <FormInput
              id="email"
              type="email"
              placeholder="tu@email.com"
              register={register("email")}
              error={errors.email}
              disabled={isSubmitting || mutation.isPending}
            />
          </div>
          <div>
            <FormInput
              id="password"
              type="password"
              placeholder="Contraseña"
              register={register("password")}
              error={errors.password}
              disabled={isSubmitting || mutation.isPending}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || mutation.isPending}
            className="text-[#efefef] bg-[#333] rounded-[13px] px-3 py-2 w-full cursor-pointer border-[1.7px] border-[#333] hover:bg-gray-300 hover:text-[#333] hover:border-gray-400 transition duration-300"
          >
            {mutation.isPending ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
          <button
            type="button"
            className="flex justify-center items-center gap-3 bg-[#efefef] text-[#333] rounded-[13px] px-3 py-2 w-full cursor-pointer border-gray-300 border-[1.7px] hover:bg-gray-300 hover:text-[#333] hover:border-gray-400 transition duration-300"
          >
            <img className="w-6" src="/google.png" alt="Icono de Google" />
            <p className="text-center">Inicia sesión con Google</p>
          </button>
          <span
            onClick={handleForgotPassword}
            className="text-gray-500 cursor-pointer underline"
          >
            ¿Olvidaste tu contraseña?
          </span>
          <div className="flex items-center gap-3 my-3">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-gray-500">si no tenes cuenta</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>
          <Link
            href="/registrarse"
            className="bg-[#efefef] text-[#333] rounded-[13px] px-3 py-2 w-full cursor-pointer border-gray-300 border-[1.7px] hover:bg-gray-300 hover:text-[#333] hover:border-gray-400 transition duration-300"
          >
            <p className="text-center">Registrate</p>
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
        />
      )}
    </div>
  );
}
