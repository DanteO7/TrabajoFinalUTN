import { useForm } from "react-hook-form";
import Modal from "../modals/modal";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateUserSchema } from "../../schema/user-schema";
import { useAuthStore } from "../../store/auth-store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUser } from "../../services/user";
import { useState } from "react";
import WhiteButton from "../buttons/white-button";
import BlackButton from "../buttons/black-button";
import { me } from "../../services/auth";
import SuccessModal from "../modals/success-modal";
import ErrorModal from "../modals/error-modal";
import { X } from "lucide-react";
import FormInput from "../inputs/form-input";
import { useTranslation } from "react-i18next";

export default function EditProfileModal({ close }) {
  const { t } = useTranslation();
  const { user, login } = useAuthStore();
  const queryClient = useQueryClient();

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
      pathologies: user?.pathologies || "",
    },
  });

  const mutation = useMutation({
    mutationKey: ["updateUser", user?.id],
    mutationFn: updateUser,
    onSuccess: async (data, variables) => {
      setSuccessMessage(t("profile.updateSuccess"));
      setSuccesModal(true);
      setBackendError(null);
      try {
        const completeUser = await me();
        login(completeUser);
      } catch {
        login({
          ...data,
          pathologies: variables.data.pathologies ?? user?.pathologies ?? "",
        });
      }
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      setTimeout(() => {
        close();
      }, 2000);
    },
    onError: (error) => {
      const data = error?.response?.data;
      let msg = t("profile.updateError");
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

      <h2 className="text-2xl font-semibold mb-4 text-center">
        {t("profile.editData")}
      </h2>
      <form
        noValidate
        className="flex max-w flex-col gap-4 mt-4"
        onSubmit={handleSubmit(onSubmit)}
      >
        <FormInput
          label={t("profile.name")}
          id="name"
          type="text"
          placeholder={t("profile.name")}
          register={register("name")}
          error={errors.name}
          disabled={isSubmitting || mutation.isPending}
        />
        <FormInput
          label={t("profile.surname")}
          id="surname"
          type="text"
          placeholder={t("profile.surname")}
          register={register("surname")}
          error={errors.surname}
          disabled={isSubmitting || mutation.isPending}
        />
        <FormInput
          label={t("profile.phone")}
          id="phoneNumber"
          type="text"
          placeholder={t("profile.phoneExample")}
          register={register("phoneNumber")}
          error={errors.phoneNumber}
          disabled={isSubmitting || mutation.isPending}
        />
        <div className="flex gap-2">
          <FormInput
            label={t("profile.age")}
            id="age"
            type="number"
            placeholder={t("profile.ageExample")}
            register={register("age")}
            error={errors.age}
            disabled={isSubmitting || mutation.isPending}
          />
          <FormInput
            label={t("profile.weight")}
            id="weight"
            type="number"
            placeholder={t("profile.weightExample")}
            register={register("weight")}
            error={errors.weight}
            disabled={isSubmitting || mutation.isPending}
          />
        </div>
        <FormInput
          label={t("profile.pathologies")}
          id="pathologies"
          placeholder={t("profile.optional")}
          register={register("pathologies")}
          error={errors.pathologies}
          disabled={isSubmitting || mutation.isPending}
          textarea
          rows={3}
        />
        <p className="text-sm text-gray-600 -mt-3">
          {t("profile.pathologiesHelp")}
        </p>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <WhiteButton
            type="button"
            text={t("common.cancel")}
            onClick={close}
            textSmall={true}
          />
          <BlackButton
            text={
              mutation.isPending
                ? t("profile.updating")
                : t("common.update")
            }
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
