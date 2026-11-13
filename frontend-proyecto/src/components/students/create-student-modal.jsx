import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import Modal from "../modals/modal";
import ErrorModal from "../modals/error-modal";
import SuccessModal from "../modals/success-modal";
import BlackButton from "../buttons/black-button";
import WhiteButton from "../buttons/white-button";
import FormInput from "../inputs/form-input";
import { getStudentPlans } from "../../services/student-plan";
import { createStudent } from "../../services/student";
import { createStudentWithoutUserSchema } from "../../schema/student-schema";
import { useState } from "react";

export default function CreateStudentModal({ tenantId, close }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createStudentWithoutUserSchema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      surname: "",
      studentPlanId: "",
    },
  });

  const { data: plans = [] } = useQuery({
    queryKey: ["getStudentPlans", tenantId],
    queryFn: () => getStudentPlans(tenantId),
  });

  const [backendError, setBackendError] = useState(null);
  const [errorModal, setErrorModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState();
  const [successModal, setSuccessModal] = useState(false);

  const mutation = useMutation({
    mutationFn: createStudent,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["getStudents", tenantId],
      });

      setSuccessMessage(t("studentCreateModal.success"));
      setSuccessModal(true);

      setTimeout(() => {
        close();
      }, 2000);
    },
    onError: (error) => {
      const data = error?.response?.data;

      let msg = t("studentCreateModal.error");

      if (typeof data === "string") msg = data;
      else if (data?.errors)
        msg = Object.values(data.errors).flat().join(" - ");
      else if (data?.message) msg = data.message;

      setBackendError(msg);
      setErrorModal(true);
    },
  });

  const onSubmit = (form) => {
    mutation.mutate({
      tenantId,
      name: form.name,
      surname: form.surname,
      studentPlanId: Number(form.studentPlanId),
    });
  };

  return (
    <Modal open onClose={close}>
      <button
        onClick={close}
        aria-label={t("common.close")}
        className="absolute top-4 right-4 text-gray-500 hover:text-black transition cursor-pointer"
      >
        <X size={20} />
      </button>

      <h2 className="text-2xl font-semibold mb-4 text-center">
        {t("studentCreateModal.title")}
      </h2>

      <div className="mb-4 rounded-lg border border-[#f0b2c0] bg-[#fff5f7] p-3 text-sm text-gray-700">
        {t("studentCreateModal.info")}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormInput
          label={t("auth.name")}
          placeholder={t("auth.name")}
          register={register("name")}
          error={errors.name}
        />

        <FormInput
          label={t("auth.surname")}
          placeholder={t("auth.surname")}
          register={register("surname")}
          error={errors.surname}
        />

        <div>
          <label className="block text-sm font-medium mb-1">
            {t("tenantPages.studentPlans.title")}
          </label>
          <select
            {...register("studentPlanId")}
            className="rounded-lg w-full px-3 py-2 text-gray-600 cursor-pointer bg-[#f1eef3] border border-gray-400 outline-none focus:ring-[1.5px] focus:border-transparent transition-[border-color,box-shadow] duration-200"
          >
            <option value="">{t("studentCreateModal.selectPlan")}</option>
            {plans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.name}
              </option>
            ))}
          </select>
          {errors.studentPlanId && (
            <p className="text-red-500 text-xs mt-1">
              {errors.studentPlanId.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <WhiteButton
            type="button"
            text={t("common.cancel")}
            onClick={close}
            textSmall={true}
          />
          <BlackButton
            type="submit"
            text={
              mutation.isPending
                ? t("studentCreateModal.creating")
                : t("studentCreateModal.create")
            }
            textSmall={true}
            disabled={mutation.isPending}
          />
        </div>
      </form>

      {errorModal && (
        <ErrorModal
          close={() => setErrorModal(false)}
          message={backendError}
          isSuccesOrError
        />
      )}

      {successModal && (
        <SuccessModal
          close={() => setSuccessModal(false)}
          message={successMessage}
          isSuccesOrError
        />
      )}
    </Modal>
  );
}
