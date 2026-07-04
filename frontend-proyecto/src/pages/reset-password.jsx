import React from "react";
import MainLayout from "../layouts/main-layout";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { changePasswordSchema } from "../schema/change-password-schema";
import { useMutation } from "@tanstack/react-query";
import { changePassword } from "../services/user";
import { useState } from "react";
import FormInput from "../components/form-input";
import { useSearchParams } from "wouter";
import ErrorModal from "../components/modals/error-modal";
import SuccessModal from "../components/modals/success-modal";
import { useLocation } from "wouter";

export default function ResetPassword() {
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
      setSuccessMessage("Contraseña cambiada correctamente");
      setSuccesModal(true);
      setBackendError(null);
      setTimeout(() => {
        setLocation("/");
      }, 3000);
    },
    onError: (error) => {
      const data = error?.response?.data;
      let msg = "Ocurrió un error al intentar cambiar la contraseña";
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
          Cambiar la contraseña
        </h2>
        <form
          noValidate
          className="flex max-w flex-col gap-6 mt-4"
          onSubmit={handleSubmit(onSubmit)}
        >
          <FormInput
            label="Nueva contraseña"
            id="newPassword"
            type="password"
            placeholder="Nueva contraseña..."
            register={register("newPassword")}
            error={errors.newPassword}
            disabled={isSubmitting || mutation.isPending}
          />
          <FormInput
            label="Confirmar contraseña"
            id="confirmNewPassword"
            type="password"
            placeholder="Nueva contraseña..."
            register={register("confirmNewPassword")}
            error={errors.confirmNewPassword}
            disabled={isSubmitting || mutation.isPending}
          />
          <button
            type="submit"
            disabled={isSubmitting || mutation.isPending}
            className="text-[#efefef] bg-[#333] rounded-[13px] w-fit px-3 py-2 cursor-pointer border-[1.7px] border-[#333] hover:bg-gray-300 hover:text-[#333] hover:border-gray-400 transition duration-300"
          >
            {mutation.isPending ? "Cambiando..." : "Cambiar contraseña"}
          </button>
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
