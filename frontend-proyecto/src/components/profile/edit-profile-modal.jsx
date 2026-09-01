import { useForm } from "react-hook-form";
import Modal from "../modals/modal";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateUserSchema } from "../../schema/user-schema";
import { useAuthStore } from "../../store/auth-store";
import { useMutation } from "@tanstack/react-query";
import { updateUser } from "../../services/user";
import { useState } from "react";
import FormInput from "../form-input";
import WhiteButton from "../buttons/white-button";
import BlackButton from "../buttons/black-button";
import { me } from "../../services/auth";
import SuccessModal from "../modals/success-modal";
import ErrorModal from "../modals/error-modal";
import { X } from "lucide-react";

export default function EditProfileModal({ close }) {
  const { user, login } = useAuthStore();

  const [backendError, setBackendError] = useState();
  const [errorModal, setErrorModal] = useState(false);
  const [succesModal, setSuccesModal] = useState(false);
  const [succesMessage, setSuccessMessage] = useState();

  const {
    register,
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
        close();
      }, 2000);
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
  return (
    <Modal open={true} onClose={close}>
      <button
        onClick={close}
        className="absolute top-4 right-4 text-gray-500 hover:text-black transition duration-200 cursor-pointer"
      >
        <X size={20} />
      </button>

      <h2 className="text-2xl font-semibold mb-4 text-center">Editar datos</h2>
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
        <div className="grid grid-cols-2 gap-3 mt-4">
          <WhiteButton
            type="button"
            text="Cancelar"
            onClick={close}
            textSmall={true}
          />
          <BlackButton
            text={mutation.isPending ? "Actualizando" : "Actualizar"}
            type="submit"
            disabled={isSubmitting || mutation.isPending}
            textSmall={true}
          />
        </div>
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
