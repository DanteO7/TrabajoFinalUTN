import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Modal from "../modals/modal";
import FormInput from "../inputs/form-input";
import SuccessModal from "../modals/success-modal";
import ErrorModal from "../modals/error-modal";
import {
  createClassSchema,
  createClassTemplateSchema,
} from "../../schema/class-schema";
import { createClass } from "../../services/class";
import { getActivities } from "../../services/activity";
import { getProfessors } from "../../services/professor";
import BlackButton from "../buttons/black-button";
import WhiteButton from "../buttons/white-button";
import { createClassTemplate } from "../../services/class-template";
import { useTranslation } from "react-i18next";

export default function ClassForm({
  tenantId,
  defaultDate,
  defaultDayOfWeek,
  close,
  isTemplate = false,
  onCreated,
}) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(
      isTemplate ? createClassTemplateSchema : createClassSchema,
    ),
    mode: "onTouched",
    defaultValues: {
      date: defaultDate || "",
      dayOfWeek: defaultDayOfWeek ?? "",
    },
  });

  const [backendError, setBackendError] = useState();
  const [errorModal, setErrorModal] = useState(false);

  const [successMessage, setSuccessMessage] = useState();
  const [successModal, setSuccessModal] = useState(false);

  const { data: activities = [] } = useQuery({
    queryKey: ["getActivities", tenantId],
    queryFn: () => getActivities(tenantId),
  });

  const { data: professors = [] } = useQuery({
    queryKey: ["getProfessors", tenantId],
    queryFn: () => getProfessors(tenantId),
  });

  const mutation = useMutation({
    mutationFn: (data) =>
      isTemplate ? createClassTemplate(data) : createClass(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: isTemplate
          ? ["getClassTemplates", tenantId]
          : ["getClasses", tenantId],
      });

      setSuccessMessage(
        isTemplate
          ? t("classForm.templateCreated")
          : t("classForm.created"),
      );

      setSuccessModal(true);

      if (!isTemplate) {
        onCreated?.();
      }

      setTimeout(() => {
        close();
      }, 2000);
    },

    onError: (error) => {
      const data = error?.response?.data;

      let msg = t("classForm.createError");

      if (typeof data === "string") msg = data;
      else if (data?.errors)
        msg = Object.values(data.errors).flat().join(" - ");
      else if (data?.title) msg = data.title;

      setBackendError(msg);
      setErrorModal(true);
    },
  });

  const onSubmit = (form) => {
    if (isTemplate) {
      mutation.mutate({
        dayOfWeek: Number(form.dayOfWeek),
        activityId: Number(form.activityId),
        professorId: Number(form.professorId),
        startTime: `${form.startTime}:00`,
        endTime: `${form.endTime}:00`,
        maxCapacity: Number(form.maxCapacity),
      });

      return;
    }

    mutation.mutate({
      activityId: Number(form.activityId),
      professorId: Number(form.professorId),
      tenantId,
      date: form.date,
      startTime: `${form.startTime}:00`,
      endTime: `${form.endTime}:00`,
      maxCapacity: Number(form.maxCapacity),
    });
  };

  return (
    <Modal open onClose={close}>
      <button
        onClick={close}
        className="absolute top-4 right-4 text-gray-500 hover:text-black cursor-pointer"
      >
        <X size={20} />
      </button>

      <h2 className="text-2xl font-semibold text-center mb-6">
        {t("classForm.title")}
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            {t("classForm.activity")}
          </label>

          <select
            {...register("activityId")}
            className="rounded-lg w-full px-3 pt-1.75 pb-2 text-gray-600 cursor-pointer bg-[#f1eef3] border border-gray-400 outline-none focus:ring-[1.5px] focus:border-transparent transition-[border-color,box-shadow] duration-200"
          >
            <option value="">{t("classForm.select")}</option>

            {activities.map((activity) => (
              <option key={activity.id} value={activity.id}>
                {activity.name}
              </option>
            ))}
          </select>

          {errors.activityId && (
            <p className="text-red-500 text-sm mt-1">
              {errors.activityId.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            {t("classForm.professor")}
          </label>

          <select
            {...register("professorId")}
            className="rounded-lg w-full px-3 pt-1.75 pb-2 text-gray-600 cursor-pointer bg-[#f1eef3] border border-gray-400 outline-none focus:ring-[1.5px] focus:border-transparent transition-[border-color,box-shadow] duration-200"
          >
            <option value="">{t("classForm.select")}</option>

            {professors
              .filter((professor) => professor.isActive === true)
              .map((professor) => (
                <option key={professor.id} value={professor.id}>
                  {professor.user.name} {professor.user.surname}
                </option>
              ))}
          </select>

          {errors.professorId && (
            <p className="text-red-500 text-sm mt-1">
              {errors.professorId.message}
            </p>
          )}
        </div>

        {isTemplate ? (
          <div>
            <label className="block text-sm font-medium mb-1">
              {t("classForm.day")}
            </label>

            <select
              {...register("dayOfWeek")}
              className="rounded-lg w-full px-3 pt-1.75 pb-2 text-gray-600 cursor-pointer bg-[#f1eef3] border border-gray-400 outline-none focus:ring-[1.5px] focus:border-transparent transition-[border-color,box-shadow] duration-200"
            >
              <option value="">{t("classForm.select")}</option>
              <option value="1">{t("classForm.monday")}</option>
              <option value="2">{t("classForm.tuesday")}</option>
              <option value="3">{t("classForm.wednesday")}</option>
              <option value="4">{t("classForm.thursday")}</option>
              <option value="5">{t("classForm.friday")}</option>
              <option value="6">{t("classForm.saturday")}</option>
              <option value="0">{t("classForm.sunday")}</option>
            </select>

            {errors.dayOfWeek && (
              <p className="text-red-500 text-sm mt-1">
                {errors.dayOfWeek.message}
              </p>
            )}
          </div>
        ) : (
          <FormInput
            type="date"
            label={t("classForm.date")}
            register={register("date")}
            error={errors.date}
          />
        )}

        <div className="grid grid-cols-2 gap-4">
          <FormInput
            type="time"
            label={t("classForm.startTime")}
            register={register("startTime")}
            error={errors.startTime}
          />

          <FormInput
            type="time"
            label={t("classForm.endTime")}
            register={register("endTime")}
            error={errors.endTime}
          />
        </div>

        <FormInput
          type="number"
          label={t("classForm.capacity")}
          register={register("maxCapacity")}
          error={errors.maxCapacity}
        />
        <div className="grid grid-cols-2 gap-3">
          <WhiteButton
            text={t("classForm.cancel")}
            onClick={close}
            textSmall={true}
          />

          <BlackButton
            text={t("classForm.create")}
            type="submit"
            textSmall={true}
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
