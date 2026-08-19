import { Link } from "wouter";
import MainLayout from "../layouts/main-layout";
import { useAuthStore } from "../store/auth-store";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateUserSchema } from "../schema/user-schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUser } from "../services/user";
import FormInput from "../components/form-input";
import ErrorModal from "../components/modals/error-modal";
import Navbar from "../components/navbar";
import { forgotPassword, me, signOut } from "../services/auth";
import { useLocation } from "wouter";
import SuccessModal from "../components/modals/success-modal";
import ChangeEmailForm from "../components/profile/change-email-form";
import EmailSentModal from "../components/modals/email-sent-modal";
import { useEffect } from "react";
import { useTenantStore } from "../store/tenant-store";
import RedButton from "../components/buttons/red-button";
import WhiteButton from "../components/buttons/white-button";
import BlackButton from "../components/buttons/black-button";

export default function Profile() {
  const queryClient = useQueryClient();

  const { user, isAuthenticated, login, logout } = useAuthStore();

  const [backendError, setBackendError] = useState();
  const [errorModal, setErrorModal] = useState(false);
  const [succesModal, setSuccesModal] = useState(false);
  const [succesMessage, setSuccessMessage] = useState();

  const [openForgotPassword, setOpenForgotPassword] = useState(false);

  const [, setLocation] = useLocation();
  const clearRoles = useTenantStore((state) => state.clearRoles);

  const [openChangeEmail, setOpenChangeEmail] = useState(false);

  const [seconds, setSeconds] = useState(0);

  const {
    register,
    getValues,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(updateUserSchema),
    mode: "onTouched",
    values: {
      name: user?.name || "",
      surname: user?.surname || "",
      email: user?.email || "",
      phoneNumber: user?.phoneNumber || "",
      age: user?.age || "",
      weight: user?.weight || "",
    },
  });

  const mutation = useMutation({
    mutationKey: ["updateUser", user?.id],
    mutationFn: updateUser,
    onSuccess: async (data) => {
      setSuccessMessage("Perfil actualizado correctamente");
      setSuccesModal(true);
      setBackendError(null);
      try {
        const completeUser = await me();
        login(completeUser);
      } catch {
        login(data);
      }
      setTimeout(() => {
        setSuccesModal(false);
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

  const onSubmit = (data) => {
    setBackendError(null);
    mutation.mutate({ id: user.id, data });
  };

  useEffect(() => {
    if (seconds <= 0) return;

    const timer = setInterval(() => {
      setSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds]);

  useEffect(() => {
    if (seconds <= 0) return;

    const interval = setInterval(() => {
      const saved = localStorage.getItem("forgotPasswordCooldown");

      if (!saved) {
        setSeconds(0);
        return;
      }

      const remaining = Math.max(
        0,
        Math.ceil((Number(saved) - Date.now()) / 1000),
      );

      setSeconds(remaining);

      if (remaining <= 0) {
        localStorage.removeItem("forgotPasswordCooldown");
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [seconds]);

  const handleForgotPassword = async () => {
    try {
      await forgotPassword({
        email: getValues("email"),
      });

      const endTime = Date.now() + 60_000;
      localStorage.setItem("forgotPasswordCooldown", endTime.toString());

      setSeconds(60);
      setOpenForgotPassword(true);
    } catch (error) {
      if (error.response?.status === 429) {
        const remaining = error.response.data.remainingSeconds;

        setSeconds(remaining);

        localStorage.setItem(
          "forgotPasswordCooldown",
          (Date.now() + remaining * 1000).toString(),
        );

        return;
      }
      setBackendError("Error enviando el correo.");
      setErrorModal(true);
    }
  };

  return (
    <MainLayout>
      <div className="mt-16 grid lg:grid-cols-[0.8fr_1fr] w-[90%] min-[900px]:w-[80%] gap-10">
        <Navbar user={user} />

        <div className="w-full lg:max-w-120">
          <h3 className="text-2xl font-semibold">Datos personales</h3>
          {isAuthenticated ? (
            <form
              noValidate
              className="flex max-w flex-col gap-4 mt-4"
              onSubmit={handleSubmit(onSubmit)}
            >
              <FormInput
                label="Nombre"
                id="name"
                type="text"
                placeholder="Nombre"
                register={register("name")}
                error={errors.name}
                disabled={isSubmitting || mutation.isPending}
              />
              <FormInput
                label="Apellido"
                id="surname"
                type="text"
                placeholder="Apellido"
                register={register("surname")}
                error={errors.surname}
                disabled={isSubmitting || mutation.isPending}
              />
              <FormInput
                label="Telefono"
                id="phoneNumber"
                type="text"
                placeholder="XX XXXX XXXXXX"
                register={register("phoneNumber")}
                error={errors.phoneNumber}
                disabled={isSubmitting || mutation.isPending}
              />
              <div className="flex gap-2">
                <FormInput
                  label="Edad"
                  id="age"
                  type="number"
                  placeholder="Entre 1-120"
                  register={register("age")}
                  error={errors.age}
                  disabled={isSubmitting || mutation.isPending}
                />
                <FormInput
                  label="Peso"
                  id="weight"
                  type="number"
                  placeholder="Entre 1-300"
                  register={register("weight")}
                  error={errors.weight}
                  disabled={isSubmitting || mutation.isPending}
                />
              </div>
              <BlackButton
                text={mutation.isPending ? "Actualizando" : "Actualizar perfil"}
                type="submit"
                disabled={isSubmitting || mutation.isPending}
                textSmall={true}
                wfit={true}
              />
              <FormInput
                disabled={true}
                label="Email"
                id="email"
                type="email"
                placeholder="Email"
                register={register("email")}
              />
              <BlackButton
                text="Cambiar Email"
                type="button"
                onClick={() => setOpenChangeEmail(true)}
                textSmall={true}
                wfit={true}
              />
              <WhiteButton
                type="button"
                disabled={seconds > 0}
                text={
                  seconds > 0 ? `Reenviar en ${seconds}s` : "Cambiar contraseña"
                }
                onClick={handleForgotPassword}
                textSmall={true}
                wfit={true}
              />
              <RedButton
                text="Cerrar sesión"
                onClick={async () => {
                  queryClient.clear();
                  clearRoles();
                  logout();

                  try {
                    await signOut();
                  } catch (error) {
                    console.log("Error en signOut:", error);
                  }
                  setLocation("/");
                }}
                textSmall={true}
                wfit={true}
              />
            </form>
          ) : (
            <div className="flex flex-col mt-5 gap-3">
              <span>No tienes iniciada la sesion</span>
              <Link
                href="/iniciar-sesion"
                className="border rounded-xl w-fit px-2 py-1"
              >
                Inicia sesión
              </Link>
            </div>
          )}
        </div>
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
      {openChangeEmail && (
        <ChangeEmailForm user={user} close={() => setOpenChangeEmail(false)} />
      )}
      {openForgotPassword && (
        <EmailSentModal
          close={() => setOpenForgotPassword(false)}
          email={user.email}
          isSuccesOrError={true}
          sendAgain={handleForgotPassword}
          seconds={seconds}
        />
      )}
    </MainLayout>
  );
}
