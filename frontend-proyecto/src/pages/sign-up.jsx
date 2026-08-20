import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { sendRegisterCode } from "../services/auth";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import FormInput from "../components/form-input";
import ErrorModal from "../components/modals/error-modal";
import { signUpSchema } from "../schema/auth-schema";
import WhiteButton from "../components/buttons/white-button";
import BlackButton from "../components/buttons/black-button";

export default function SignUp() {
  const [, setLocation] = useLocation();
  const [errorModal, setErrorModal] = useState(false);
  const [backendError, setBackendError] = useState();

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signUpSchema),
    mode: "onTouched",
  });

  const mutation = useMutation({
    mutationKey: ["sendRegisterCode"],
    mutationFn: sendRegisterCode,
    onSuccess: () => {
      const formData = getValues();
      localStorage.setItem("pendingSignUp", JSON.stringify(formData));
      setLocation("/verificar-codigo");
    },
    onError: (error) => {
      const data = error?.response?.data;
      let msg = "Error al enviar el código";
      if (typeof data === "string") msg = data;
      else if (data?.errors)
        msg = Object.values(data.errors).flat().join(" - ");
      else if (data?.message) msg = data.message;
      setBackendError(msg);
      setErrorModal(true);
    },
  });

  const onSubmit = (credentials) => {
    setBackendError(null);
    mutation.mutate({ email: credentials.email });
  };

  return (
    <div className="bg-[#ede9ee] min-h-screen text-[11px] flex">
      <div className="text-black p-5 mt-10 mx-auto min-[900px]:my-auto w-11/12 md:w-1/2 lg:w-[22%]">
        <form
          noValidate
          className="flex flex-col gap-3 text-[14px]"
          onSubmit={handleSubmit(onSubmit)}
        >
          <h2 className="text-center text-2xl font-bold min-[900px]:hidden">
            Turno Fácil
          </h2>
          <p className="text-center text-gray-700 font-semibold text-[17px] min-[900px]:text-2xl">
            Registrarse
          </p>

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

          <BlackButton
            type="submit"
            text={mutation.isPending ? "Enviando..." : "Continuar"}
            disabled={isSubmitting || mutation.isPending}
            textSmall={true}
          />

          <div className="flex items-center gap-3 my-3">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-gray-500">si ya tienes cuenta</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          <Link href="/iniciar-sesion">
            <WhiteButton textSmall={true} text="Inicia sesión" />
          </Link>
        </form>
      </div>

      <div className="hidden min-[900px]:flex w-[60%] bg-gray-800 pt-2">
        <div className="text-center flex flex-col w-full item-center mt-10">
          <h2 className="text-4xl font-bold text-[#efefef]">Turno Fácil</h2>
          <p className="text-gray-400 font-semibold text-2xl">Registrarse</p>
          <h3 className="text-gray-300 text-xl mt-2">
            Gestioná todos tus negocios desde un solo lugar
          </h3>
        </div>
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
