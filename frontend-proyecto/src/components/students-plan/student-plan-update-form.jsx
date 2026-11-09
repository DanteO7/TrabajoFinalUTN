import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import FormInput from "../inputs/form-input";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ErrorModal from "../modals/error-modal";
import Modal from "../modals/modal";
import SuccessModal from "../modals/success-modal";
import { updateStudentPlan } from "../../services/student-plan";
import { updateStudentPlanSchema } from "../../schema/students-plan-schema";
import WhiteButton from "../buttons/white-button";
import BlackButton from "../buttons/black-button";
import { useTranslation } from "react-i18next";

export default function StudentPlanUpdateForm({
  planId,
  tenantId,
  plan,
  close,
}) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(updateStudentPlanSchema),
    mode: "onTouched",
    defaultValues: {
      name: plan?.name,
      classesPerMonth: plan?.classesPerMonth,
      price: plan?.price,
    },
  });

  const [backendError, setBackendError] = useState();
  const [errorModal, setErrorModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState();
  const [successModal, setSuccessModal] = useState(false);

  const mutation = useMutation({
    mutationKey: ["updateStudentPlan", planId],
    mutationFn: (data) => updateStudentPlan(planId, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["getStudentPlans", tenantId],
      });

      setSuccessMessage(t("planUi.studentUpdateSuccess"));
      setSuccessModal(true);
      setBackendError(null);

      setTimeout(() => {
        close();
      }, 2000);
    },

    onError: (error) => {
      const data = error?.response?.data;

      let msg = t("planUi.updateError");

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
      classesPerMonth: form.classesPerMonth
        ? parseInt(form.classesPerMonth)
        : null,
      price: form.price ? parseFloat(form.price) : null,
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
        {t("planUi.updatePlan")}
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
            text={mutation.isPending ? t("planUi.updating") : t("planUi.updatePlan")}
            disabled={mutation.isPending}
            type="submit"
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
