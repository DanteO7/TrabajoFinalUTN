import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import FormInput from "../inputs/form-input";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ErrorModal from "../modals/error-modal";
import Modal from "../modals/modal";
import SuccessModal from "../modals/success-modal";
import WhiteButton from "../buttons/white-button";
import BlackButton from "../buttons/black-button";
import { createNews } from "../../services/news";
import { useAuthStore } from "../../store/auth-store";
import { createNewsSchema } from "../../schema/news-schema";
import { useTranslation } from "react-i18next";

export default function NewsForm({
  tenantId,
  close,
  initialTitle = "",
  initialContent = "",
  tenantOnly = false,
  onCreated,
}) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const isAdmin = user?.roles?.includes("Admin");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createNewsSchema),
    mode: "onTouched",
    defaultValues: {
      title: initialTitle,
      content: initialContent,
    },
  });

  const [backendError, setBackendError] = useState();
  const [errorModal, setErrorModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState();
  const [successModal, setSuccessModal] = useState(false);

  const mutation = useMutation({
    mutationKey: ["createNews"],
    mutationFn: createNews,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["news", tenantId],
      });

      onCreated?.();
      setSuccessMessage(t("newsUi.createSuccess"));
      setSuccessModal(true);
      setBackendError(null);

      setTimeout(() => {
        close();
      }, 2000);
    },

    onError: (error) => {
      const data = error?.response?.data;

      let msg = t("newsUi.createError");

      if (typeof data === "string") msg = data;
      else if (data?.errors)
        msg = Object.values(data.errors).flat().join(" - ");
      else if (data?.title) msg = data.title;

      setBackendError(msg);
      setErrorModal(true);
    },
  });

  const onSubmit = (form) => {
    const tenantIdValue = tenantOnly
      ? "tenant"
      : isAdmin
        ? form.tenantId
        : "tenant";

    mutation.mutate({
      title: form.title,
      content: form.content,
      tenantId: tenantIdValue === "global" ? null : tenantId,
    });
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
        {t("newsUi.createTitle")}
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormInput
          label={t("newsUi.title")}
          placeholder={t("newsUi.titlePlaceholder")}
          register={register("title")}
          error={errors.title}
        />

        <FormInput
          textarea
          placeholder={t("newsUi.contentPlaceholder")}
          label={t("newsUi.content")}
          register={register("content")}
          error={errors.content}
        />

        {isAdmin && !tenantOnly && (
          <select
            {...register("tenantId")}
            className="rounded-lg border border-gray-400 bg-[#f1eef3] p-2 text-gray-700 cursor-pointer"
          >
            <option value="global">{t("newsUi.global")}</option>
            <option value="tenant">{t("newsUi.thisBusiness")}</option>
          </select>
        )}

        <div className="grid grid-cols-2 gap-3">
          <WhiteButton text={t("common.cancel")} onClick={close} textSmall={true} />
          <BlackButton
            text={
              mutation.isPending
                ? t("newsUi.creating")
                : t("newsUi.create")
            }
            type="submit"
            disabled={mutation.isPending}
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

      {successModal && (
        <SuccessModal
          close={() => setSuccessModal(false)}
          message={successMessage}
          isSuccesOrError={true}
        />
      )}
    </Modal>
  );
}
