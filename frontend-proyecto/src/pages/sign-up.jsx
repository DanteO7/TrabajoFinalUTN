import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { signUpSchema } from "../schema/auth-schema";
import { useMutation } from "@tanstack/react-query";
import { sendRegisterCode, signUp } from "../services/auth";
import { useAuthStore } from "../store/auth-store";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import FormInput from "../components/form-input";
import ErrorModal from "../components/modals/error-modal";

export default function SignUp() {
  const { login } = useAuthStore();
  const [, setLocation] = useLocation();
  const [errorModal, setErrorModal] = useState(false);
  const [backendError, setBackendError] = useState();
  const [codeSent, setCodeSent] = useState(false);

  const {
    register,
    getValues,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signUpSchema),
    mode: "onTouched",
  });

  const mutation = useMutation({
    mutationKey: ["signup"],
    mutationFn: signUp,
    onSuccess: (data) => {
      login(data);
      setLocation("/");
    },
    onError: (error) => {
      const data = error?.response?.data;
      let msg = "Ocurrió un error al registrarte";
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

  const handleSendCode = async () => {
    const email = getValues("email");

    if (!email) {
      setBackendError("Ingresa un email");
      setErrorModal(true);
      return;
    }

    try {
      console.log(email);
      sendRegisterCode({
        email: getValues("email"),
      });
      setCodeSent(true);
    } catch (error) {
      setBackendError(`Error enviando código: ${error}`);
      setErrorModal(true);
    }
  };

  return (
    <div className="bg-[#ede9ee] pt-10 h-full text-[12px]">
      <div className="text-black p-5 m-auto w-[90%] md:w-1/3 lg:w-[23%]">
        <form
          noValidate
          className="flex max-w flex-col gap-3.5"
          onSubmit={handleSubmit(onSubmit)}
        >
          <h2 className="text-center text-2xl font-bold">Turno Fácil</h2>
          <p className="text-center text-gray-700 text-[16px]">Registrarse</p>
          <div>
            <FormInput
              id="name"
              type="text"
              placeholder="Nombre"
              register={register("name")}
              error={errors.name}
              disabled={isSubmitting || mutation.isPending}
            />
          </div>
          <div>
            <FormInput
              id="surname"
              type="text"
              placeholder="Apellido"
              register={register("surname")}
              error={errors.surname}
              disabled={isSubmitting || mutation.isPending}
            />
          </div>
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
          <div>
            <FormInput
              id="confirmPassword"
              type="password"
              placeholder="Repite la Contraseña"
              register={register("confirmPassword")}
              error={errors.confirmPassword}
              disabled={isSubmitting || mutation.isPending}
            />
          </div>
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

          <button type="button" onClick={handleSendCode}>
            Enviar código
          </button>
          <button
            type="submit"
            disabled={isSubmitting || mutation.isPending}
            className="text-[#efefef] bg-[#333] rounded-[13px] px-3 py-2 w-full cursor-pointer border-[1.7px] border-[#333] hover:bg-gray-300 hover:text-[#333] hover:border-gray-400 transition duration-300"
          >
            {mutation.isPending ? "Registrando..." : "Crear Cuenta"}
          </button>
          <button
            type="button"
            className="flex justify-center items-center gap-3 bg-[#efefef] text-[#333] rounded-[13px] px-3 py-2 w-full cursor-pointer border-gray-200 border-[1.7px] hover:bg-gray-300 hover:text-[#333] hover:border-gray-400 transition duration-300"
          >
            <img className="w-6" src="/google.png" alt="Icono de Google" />
            <p className="text-center">Registrate con Google</p>
          </button>
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-gray-500 text-sm">si ya tienes cuenta</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>
          <Link
            href="/sign-in"
            className="bg-[#efefef] text-[#333] rounded-[13px] px-3 py-2 w-full cursor-pointer border-gray-200 border-[1.7px] hover:bg-gray-300 hover:text-[#333] hover:border-gray-400 transition duration-300"
          >
            <p className="text-center">Inicia sesión</p>
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
    </div>
  );
}
