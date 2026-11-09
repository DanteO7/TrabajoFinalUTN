import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import FormInput from "../inputs/form-input";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ErrorModal from "../modals/error-modal";
import Modal from "../modals/modal";
import SuccessModal from "../modals/success-modal";
import { createStudentPlanSchema } from "../../schema/students-plan-schema";
import { createStudentPlan } from "../../services/student-plan";
import WhiteButton from "../buttons/white-button";
import BlackButton from "../buttons/black-button";
import { useTranslation } from "react-i18next";

export default function StudentPlanForm({ tenantId, close, onCreated }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createStudentPlanSchema),
    mode: "onTouched",
  });

  const [backendError, setBackendError] = useState();
  const [errorModal, setErrorModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState();
  const [successModal, setSuccessModal] = useState(false);

  const mutation = useMutation({
    mutationKey: ["createStudentPlan"],
    mutationFn: createStudentPlan,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["getStudentPlans", tenantId],
      });

      onCreated?.();
      setSuccessMessage(t("planUi.studentCreateSuccess"));
      setSuccessModal(true);
      setBackendError(null);

      setTimeout(() => {
        close();
      }, 2000);
    },

    onError: (error) => {
      const data = error?.response?.data;

      let msg = t("planUi.createError");

      if (typeof data === "string") msg = data;
      else if (data?.errors)
        msg = Object.values(data.errors).flat().join(" - ");
      else if (data?.message) msg = data.message;
      else if (data?.title) msg = data.title;

      setBackendError(msg);
      setErrorModal(true);
    },
  });

  const onSubmit = (form) => {
    mutation.mutate({
      name: form.name,
      classesPerMonth: parseInt(form.classesPerMonth),
      price: parseFloat(form.price),
      tenantId,
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
        {t("planUi.createStudentPlan")}
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormInput
          label={t("planUi.name")}
          placeholder={t("planUi.studentPlanPlaceholder")}
          register={register("name")}
          error={errors.name}
        />

        <FormInput
          label={t("planUi.classesPerMonth")}
          type="number"
          placeholder={t("planUi.classesPlaceholder")}
          register={register("classesPerMonth")}
          error={errors.classesPerMonth}
        />

        <FormInput
          label={t("planUi.price")}
          type="number"
          step="0.01"
          placeholder={t("planUi.pricePlaceholder")}
          register={register("price")}
          error={errors.price}
        />

        <div className="grid grid-cols-2 gap-3">
          <WhiteButton text={t("common.cancel")} onClick={close} textSmall={true} />
          <BlackButton
            text={mutation.isPending ? t("planUi.creating") : t("planUi.createPlan")}
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
