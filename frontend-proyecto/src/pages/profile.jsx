import { Link } from "wouter";
import MainLayout from "../layouts/main-layout";
import { useAuthStore } from "../store/auth-store";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateUserSchema } from "../schema/user-schema";
import { useMutation } from "@tanstack/react-query";
import { updateUser } from "../services/user";
import FormInput from "../components/form-input";
import ErrorModal from "../components/modals/error-modal";
import Navbar from "../components/navbar";
import { forgotPassword, signOut } from "../services/auth";
import { useLocation } from "wouter";
import SuccessModal from "../components/modals/success-modal";
import ChangeEmailForm from "../components/profile/change-email-form";
import EmailSentModal from "../components/modals/email-sent-modal";

export default function Profile() {
  const { user, isAuthenticated, login, logout } = useAuthStore();

  const [backendError, setBackendError] = useState();
  const [errorModal, setErrorModal] = useState(false);
  const [succesModal, setSuccesModal] = useState(false);
  const [succesMessage, setSuccessMessage] = useState();

  const [openForgotPassword, setOpenForgotPassword] = useState(false);

  const [, setLocation] = useLocation();

  const [openChangeEmail, setOpenChangeEmail] = useState(false);

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
    },
  });

  const mutation = useMutation({
    mutationKey: ["updateUser", user?.id],
    mutationFn: updateUser,
    onSuccess: (data) => {
      setSuccessMessage("Perfil actualizado correctamente");
      setSuccesModal(true);
      setBackendError(null);
      login(data);
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

  const handleForgotPassword = async () => {
    try {
      forgotPassword({
        email: getValues("email"),
      });
      setOpenForgotPassword(true);
    } catch (error) {
      setBackendError(`Error enviando email: ${error}`);
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
                disabled={true}
                label="Email"
                id="email"
                type="email"
                placeholder="Email"
                register={register("email")}
              />
              <button
                type="button"
                onClick={() => setOpenChangeEmail(true)}
                className="text-[#efefef] w-fit bg-[#333] rounded-[13px] px-5 py-2  cursor-pointer border-[1.7px] border-[#333] hover:bg-gray-300 hover:text-[#333] hover:border-gray-400 transition duration-300"
              >
                Cambiar Email
              </button>
              <FormInput
                label="Telefono"
                id="phoneNumber"
                type="text"
                placeholder="XX XXXX XXXXXX"
                register={register("phoneNumber")}
                error={errors.phoneNumber}
                disabled={isSubmitting || mutation.isPending}
              />
              <button
                type="submit"
                disabled={isSubmitting || mutation.isPending}
                className="text-[#efefef] w-fit bg-[#333] rounded-[13px] px-5 py-2  cursor-pointer border-[1.7px] border-[#333] hover:bg-gray-300 hover:text-[#333] hover:border-gray-400 transition duration-300"
              >
                {mutation.isPending ? "Actualizando" : "Actualizar perfil"}
              </button>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-[#efefef] w-fit bg-[#333] rounded-[13px] px-5 py-2  cursor-pointer border-[1.7px] border-[#333] hover:bg-gray-300 hover:text-[#333] hover:border-gray-400 transition duration-300"
              >
                Cambiar contraseña
              </button>
              <button
                onClick={() => {
                  signOut();
                  logout();
                  setLocation("/");
                }}
                className="text-[#efefef] w-fit bg-[#d53b3b] rounded-[13px] px-5 py-2  cursor-pointer border-[1.7px] border-[#333] hover:bg-gray-300 hover:text-[#333] hover:border-gray-400 transition duration-300"
              >
                Cerrar sesión
              </button>
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
        />
      )}
    </MainLayout>
  );
}
