import { useState, useMemo, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { signUp, sendRegisterCode } from "../services/auth";
import { useAuthStore } from "../store/auth-store";
import { Link, useLocation } from "wouter";
import FormInput from "../components/form-input";
import ErrorModal from "../components/modals/error-modal";
import { useForm } from "react-hook-form";
import { useTenantStore } from "../store/tenant-store";

export default function VerifyCode() {
  const [, setLocation] = useLocation();
  const { login } = useAuthStore();
  const clearRoles = useTenantStore((state) => state.clearRoles);
  const [seconds, setSeconds] = useState(0);
  const [errorModal, setErrorModal] = useState(false);
  const [backendError, setBackendError] = useState();

  const formData = useMemo(() => {
    const pendingData = localStorage.getItem("pendingSignUp");
    if (!pendingData) {
      setLocation("/registrarse");
      return null;
    }
    return JSON.parse(pendingData);
  }, [setLocation]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
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

  const signUpMutation = useMutation({
    mutationFn: signUp,
    onSuccess: (data) => {
      localStorage.removeItem("pendingSignUp");
      clearRoles();
      login(data);
      setLocation("/");
    },
    onError: (error) => {
      const data = error?.response?.data;
      let msg = "Error al crear la cuenta";
      if (typeof data === "string") msg = data;
      else if (data?.errors)
        msg = Object.values(data.errors).flat().join(" - ");
      else if (data?.message) msg = data.message;
      setBackendError(msg);
      setErrorModal(true);
    },
  });

  const resendMutation = useMutation({
    mutationFn: () => sendRegisterCode({ email: formData.email }),
    onSuccess: () => {
      setSeconds(60);
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

  const onSubmit = (data) => {
    if (!formData) return;
    signUpMutation.mutate({
      ...formData,
      verificationCode: data.verificationCode,
    });
  };

  if (!formData) {
    return null;
  }

  return (
    <div className="bg-[#ede9ee] min-h-screen text-[11px] flex">
      <div className="text-black p-5 mt-10 mx-auto min-[900px]:my-auto w-11/12 md:w-1/2 lg:w-[22%]">
        <form
          noValidate
          className="flex flex-col gap-4"
          onSubmit={handleSubmit(onSubmit)}
        >
          <h2 className="text-center text-2xl font-bold min-[900px]:hidden">
            Turno Fácil
          </h2>

          <p className="text-center text-gray-700 font-semibold text-[17px] min-[900px]:text-2xl">
            Verificar correo
          </p>

          <div className="text-center">
            <p className="text-[13px] min-[900px]:text-[15px] text-gray-600 mb-1">
              Hemos enviado el código de verificacion a:
            </p>
            <p className="font-semibold text-[15px] text-[#333]">
              {formData.email}
            </p>
          </div>

          <div>
            <FormInput
              id="verificationCode"
              type="text"
              placeholder="Ingresá el código de verificación"
              register={register("verificationCode", {
                required: "El código es obligatorio",
                minLength: {
                  value: 4,
                  message: "El código debe tener al menos 4 caracteres",
                },
              })}
              error={errors.verificationCode}
            />
          </div>

          <button
            type="button"
            onClick={() => resendMutation.mutate()}
            disabled={seconds > 0 || resendMutation.isPending}
            className={`rounded-[13px] px-3 py-2 border-[1.7px] border-[#333] transition-all duration-300 ${
              seconds > 0
                ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                : "hover:bg-gray-300 hover:text-[#333] cursor-pointer text-[#333]"
            }`}
          >
            {seconds > 0 ? `Reenviar en ${seconds}s` : "Reenviar código"}
          </button>

          <button
            type="submit"
            disabled={signUpMutation.isPending}
            className="text-[#efefef] bg-[#333] rounded-[13px] px-3 py-2 w-full cursor-pointer border-[1.7px] border-[#333] hover:bg-gray-300 hover:text-[#333] hover:border-gray-400 transition duration-300 disabled:opacity-50"
          >
            {signUpMutation.isPending ? "Creando cuenta..." : "Crear cuenta"}
          </button>

          <div className="flex items-center gap-3 my-3">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-gray-500">¿Cambiar email?</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          <Link
            href="/registrarse"
            className="bg-[#efefef] text-[#333] rounded-[13px] px-3 py-2 w-full cursor-pointer border-gray-300 border-[1.7px] hover:bg-gray-300 text-center transition duration-300"
          >
            Volver
          </Link>
        </form>
      </div>

      <div className="hidden min-[900px]:flex w-[60%] bg-gray-800 pt-2">
        <div className="text-center flex flex-col w-full item-center mt-10">
          <h2 className="text-4xl font-bold text-[#efefef]">Turno Fácil</h2>
          <p className="text-gray-400 font-semibold text-2xl">Verificación</p>
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
