import { X, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Modal from "../modals/modal";
import FormInput from "../inputs/form-input";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { updateClass, deleteClass } from "../../services/class";
import { getActivities } from "../../services/activity";
import { getProfessors } from "../../services/professor";
import {
  createReservation,
  deleteReservation,
  getReservationsByStudentId,
} from "../../services/reservation";
import SuccessModal from "../modals/success-modal";
import ErrorModal from "../modals/error-modal";
import {
  updateClassSchema,
  updateClassTemplateSchema,
} from "../../schema/class-schema";
import { useAuthStore } from "../../store/auth-store";
import { useHasPermission } from "../../store/tenant-store";
import { getStudentByUser } from "../../services/student";
import ClassStudentsModal from "./class-students-modal";
import ConfirmModal from "../modals/confirm-modal";
import {
  createWaitlist,
  deleteWaitlist,
  getWaitlistByStudentId,
} from "../../services/waitlist";
import WhiteButton from "../buttons/white-button";
import BlackButton from "../buttons/black-button";
import RedButton from "../buttons/red-button";
import {
  deleteClassTemplate,
  updateClassTemplate,
} from "../../services/class-template";
import { getLocale, formatNumber } from "../../utils/formatting";
import { useTranslation } from "react-i18next";

export default function ClassModal({
  classItem,
  tenantId,
  close,
  isTemplate = false,
}) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { user } = useAuthStore();

  const canUpdateClass = useHasPermission(tenantId, "CLASS_UPDATE");
  const canDeleteClass = useHasPermission(tenantId, "CLASS_DELETE");
  const canReadStudents = useHasPermission(tenantId, "STUDENT_READ");
  const canCreateReservation = useHasPermission(tenantId, "RESERVATION_CREATE");
  const canDeleteReservation = useHasPermission(tenantId, "RESERVATION_DELETE");

  const [editing, setEditing] = useState(false);
  const [currentClass, setCurrentClass] = useState(classItem);
  const [backendError, setBackendError] = useState();
  const [errorModal, setErrorModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState();
  const [successModal, setSuccessModal] = useState(false);
  const [studentsModal, setStudentsModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);

  const classStarted = isTemplate
    ? false
    : new Date() >=
      new Date(`${currentClass.date.split("T")[0]}T${currentClass.startTime}`);

  const formatDateWithDay = (dateString) => {
    if (isTemplate) {
      const date = new Date(2024, 0, 7 + Number(dateString));
      const dayName = date.toLocaleDateString(getLocale(), { weekday: "long" });
      return dayName.charAt(0).toUpperCase() + dayName.slice(1);
    }

    const [year, month, day] = dateString.split("T")[0].split("-");

    const date = new Date(year, month - 1, day);

    const dayName = date.toLocaleDateString(getLocale(), {
      weekday: "long",
    });

    const dateFormatted = date.toLocaleDateString(getLocale());

    return `${dayName.charAt(0).toUpperCase() + dayName.slice(1)} ${dateFormatted}`;
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(
      isTemplate ? updateClassTemplateSchema : updateClassSchema,
    ),
    mode: "onTouched",
    defaultValues: {
      activityId: currentClass.activityId?.toString() || "",
      professorId: currentClass.professorId?.toString() || "",
      date: currentClass.date || "",
      dayOfWeek: currentClass.dayOfWeek?.toString() || "",
      startTime: currentClass.startTime?.slice(0, 5) || "",
      endTime: currentClass.endTime?.slice(0, 5) || "",
      maxCapacity: currentClass.maxCapacity?.toString() || "",
    },
  });

  const { data: activities = [] } = useQuery({
    queryKey: ["getActivities", tenantId],
    queryFn: () => getActivities(tenantId),
  });

  const { data: professors = [] } = useQuery({
    queryKey: ["getProfessors", tenantId],
    queryFn: () => getProfessors(tenantId),
  });

  const { data: currentStudent } = useQuery({
    queryKey: ["getStudentByUser", tenantId, user?.id],
    queryFn: () => getStudentByUser(tenantId),
    enabled: !isTemplate && canCreateReservation && !!user?.id,
  });

  const { data: reservations = [] } = useQuery({
    queryKey: ["getReservationsByStudentId", currentStudent?.id],
    queryFn: () => getReservationsByStudentId(currentStudent.id),
    enabled: !isTemplate && !!currentStudent,
  });

  const { data: waitlists = [] } = useQuery({
    queryKey: ["getWaitlistByStudentId", currentStudent?.id],
    queryFn: () => getWaitlistByStudentId(currentStudent.id),
    enabled: !isTemplate && !!currentStudent,
  });

  const currentWaitlist = waitlists.find((w) => w.classId === currentClass.id);

  const isInWaitlist = !!currentWaitlist;

  const isFull = currentClass.reservationsCount >= currentClass.maxCapacity;

  const currentReservation = reservations.find(
    (r) => r.classId === currentClass.id,
  );

  const isReserved = !!currentReservation;

  const deleteMutation = useMutation({
    mutationFn: () =>
      isTemplate
        ? deleteClassTemplate(currentClass.id)
        : deleteClass(currentClass.id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [isTemplate ? "getClassTemplates" : "getClasses", tenantId],
      });

      setConfirmModal(false);
      setSuccessMessage(
        isTemplate
          ? t("classModal.templateDeleteSuccess")
          : t("classModal.deleteSuccess"),
      );
      setSuccessModal(true);

      setTimeout(() => {
        close();
      }, 2000);
    },

    onError: (error) => {
      const data = error?.response?.data;

      let msg = t("classModal.deleteError");

      if (typeof data === "string") msg = data;
      else if (data?.errors)
        msg = Object.values(data.errors).flat().join(" - ");
      else if (data?.message) msg = data.message;

      setConfirmModal(false);
      setBackendError(msg);
      setErrorModal(true);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (form) =>
      isTemplate
        ? updateClassTemplate(currentClass.id, {
            activityId: form.activityId ? Number(form.activityId) : undefined,
            professorId: form.professorId
              ? Number(form.professorId)
              : undefined,
            dayOfWeek: Number(form.dayOfWeek),
            startTime: form.startTime ? `${form.startTime}:00` : undefined,
            endTime: form.endTime ? `${form.endTime}:00` : undefined,
            maxCapacity: form.maxCapacity
              ? Number(form.maxCapacity)
              : undefined,
          })
        : updateClass(currentClass.id, {
            activityId: form.activityId ? Number(form.activityId) : undefined,
            professorId: form.professorId
              ? Number(form.professorId)
              : undefined,
            date: form.date || undefined,
            startTime: form.startTime ? `${form.startTime}:00` : undefined,
            endTime: form.endTime ? `${form.endTime}:00` : undefined,
            maxCapacity: form.maxCapacity
              ? Number(form.maxCapacity)
              : undefined,
          }),

    onSuccess: (updatedClass) => {
      queryClient.invalidateQueries({
        queryKey: [isTemplate ? "getClassTemplates" : "getClasses", tenantId],
      });

      setSuccessMessage(
        isTemplate
          ? t("classModal.templateUpdateSuccess")
          : t("classModal.updateSuccess"),
      );

      setSuccessModal(true);
      setCurrentClass(updatedClass);
      setEditing(false);

      setTimeout(() => {
        setSuccessModal(false);
      }, 2000);
    },

    onError: (error) => {
      const data = error?.response?.data;

      let msg = t("classModal.updateError");

      if (typeof data === "string") msg = data;
      else if (data?.errors)
        msg = Object.values(data.errors).flat().join(" - ");
      else if (data?.message) msg = data.message;

      setBackendError(msg);
      setErrorModal(true);
    },
  });

  const reservationMutation = useMutation({
    mutationFn: () =>
      createReservation({
        classId: currentClass.id,
        tenantId: tenantId,
        studentIds: [currentStudent.id],
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["getClasses", tenantId],
      });

      setSuccessMessage(t("classModal.joinSuccess"));
      setSuccessModal(true);

      setTimeout(() => {
        close();
      }, 2000);
    },

    onError: (error) => {
      const data = error?.response?.data;

      let msg = t("classModal.joinError");

      if (typeof data === "string") msg = data;
      else if (data?.errors)
        msg = Object.values(data.errors).flat().join(" - ");
      else if (data?.message) msg = data.message;

      setBackendError(msg);
      setErrorModal(true);
    },
  });

  const waitlistMutation = useMutation({
    mutationFn: () =>
      createWaitlist({
        classId: currentClass.id,
        studentId: currentStudent.id,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["getWaitlistByStudentId", currentStudent.id],
      });

      setSuccessMessage(t("classModal.waitlistJoinSuccess"));

      setSuccessModal(true);

      setTimeout(() => {
        setSuccessModal(false);
      }, 2000);
    },

    onError: (error) => {
      const data = error?.response?.data;

      let msg = t("classModal.waitlistJoinError");

      if (typeof data === "string") msg = data;
      else if (data?.errors)
        msg = Object.values(data.errors).flat().join(" - ");
      else if (data?.message) msg = data.message;

      setBackendError(msg);
      setErrorModal(true);
    },
  });

  const deleteWaitlistMutation = useMutation({
    mutationFn: () => deleteWaitlist(currentWaitlist.id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["getWaitlistByStudentId", currentStudent.id],
      });

      setSuccessMessage(t("classModal.waitlistLeaveSuccess"));

      setSuccessModal(true);

      setTimeout(() => {
        setSuccessModal(false);
      }, 2000);
    },

    onError: (error) => {
      const data = error?.response?.data;

      let msg = t("classModal.waitlistLeaveError");

      if (typeof data === "string") msg = data;
      else if (data?.errors)
        msg = Object.values(data.errors).flat().join(" - ");
      else if (data?.message) msg = data.message;

      setBackendError(msg);
      setErrorModal(true);
    },
  });

  const cancelReservationMutation = useMutation({
    mutationFn: () => deleteReservation(currentReservation.id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["getClasses", tenantId],
      });

      queryClient.invalidateQueries({
        queryKey: ["getReservationsByStudentId", currentStudent.id],
      });

      setSuccessMessage(t("classModal.leaveSuccess"));
      setSuccessModal(true);

      setTimeout(() => {
        close();
      }, 2000);
    },

    onError: (error) => {
      const data = error?.response?.data;

      let msg = t("classModal.leaveError");

      if (typeof data === "string") msg = data;
      else if (data?.errors)
        msg = Object.values(data.errors).flat().join(" - ");
      else if (data?.message) msg = data.message;

      setBackendError(msg);
      setErrorModal(true);
    },
  });

  const onSubmit = (form) => {
    updateMutation.mutate(form);
  };

  const decreaseReservationCount = (quantity) => {
    const updatedClass = {
      ...currentClass,
      reservationsCount: currentClass.reservationsCount - quantity,
    };

    setCurrentClass(updatedClass);
  };

  const increaseReservationCount = (quantity) => {
    const updatedClass = {
      ...currentClass,
      reservationsCount: currentClass.reservationsCount + quantity,
    };

    setCurrentClass(updatedClass);
  };

  return (
    <Modal open onClose={close}>
      <button
        onClick={close}
        className="absolute top-4 right-4 text-gray-500 hover:text-black transition duration-200 cursor-pointer"
      >
        <X size={20} />
      </button>

      {!editing ? (
        <>
          <h2 className="text-2xl font-semibold mb-2">
            {currentClass.activityName}
          </h2>

          <p className="text-gray-600 mb-6">
            {isTemplate
              ? `${currentClass.professorName} ${currentClass.professorSurname}`
              : `${currentClass.professor.user.name} ${currentClass.professor.user.surname}`}
          </p>

          <div className="space-y-4">
            <div className="bg-[#f4f0f5] rounded-lg border border-gray-400 shadow-md p-4">
              <p className="text-sm text-gray-600 mb-1">
                {isTemplate ? t("classForm.day") : t("classForm.date")}
              </p>

              <p className="font-semibold text-[#333]">
                {isTemplate
                  ? formatDateWithDay(currentClass.dayOfWeek)
                  : formatDateWithDay(currentClass.date)}
              </p>
            </div>

            <div className="bg-[#f4f0f5] rounded-lg border border-gray-400 shadow-md p-4">
              <p className="text-sm text-gray-600 mb-1">
                {t("classModal.schedule")}
              </p>

              <p className="font-semibold text-[#333]">
                {currentClass.startTime.slice(0, 5)} -{" "}
                {currentClass.endTime.slice(0, 5)}
              </p>
            </div>

            <div
              className={`bg-[#f4f0f5] rounded-lg border border-gray-400 shadow-md p-4 ${
                !isTemplate && isFull && "bg-red-100"
              }`}
            >
              <p className="text-sm text-gray-600 mb-1">
                {isTemplate
                  ? t("classModal.students")
                  : isFull
                    ? t("classModal.full")
                    : t("classModal.availability")}
              </p>

              <div className="flex justify-between items-center gap-3">
                <p className="font-semibold text-[14px] min-[900px]:text-[16px] text-[#333]">
                  {t("classModal.availabilityCount", {
                    count: formatNumber(
                      isTemplate
                        ? currentClass.students.length
                        : currentClass.reservationsCount,
                    ),
                    capacity: formatNumber(currentClass.maxCapacity),
                  })}
                </p>

                <div className="flex items-center gap-2">
                  {canReadStudents && (
                    <button
                      onClick={() => setStudentsModal(true)}
                      className="bg-[#333] text-[12px] min-[900px]:text-[16px] text-white px-3 min-[900px]:px-4 py-1.5 rounded-lg text-sm hover:bg-[#222] transition cursor-pointer"
                    >
                      {t("classModal.viewStudents")}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {canUpdateClass || canDeleteClass ? (
            classStarted ? (
              <div className="mt-8">
                <WhiteButton text={t("classModal.unavailable")} textSmall />
              </div>
            ) : (
              <div className="flex gap-2 mt-8">
                {canDeleteClass && (
                  <RedButton
                    text={t("classModal.delete")}
                    disabled={deleteMutation.isPending}
                    onClick={() => setConfirmModal(true)}
                    textSmall={true}
                    img={<Trash2 size={18} />}
                  />
                )}

                {canUpdateClass && (
                  <BlackButton
                    text={t("classModal.edit")}
                    onClick={() => setEditing(true)}
                    textSmall={true}
                    img={<Pencil size={18} />}
                  />
                )}
              </div>
            )
          ) : canCreateReservation ? (
            classStarted ? (
              <div className="mt-8">
                <WhiteButton text={t("classModal.unavailable")} textSmall />
              </div>
            ) : isReserved ? (
              <div>
                {canDeleteReservation && (
                  <RedButton
                    onClick={() => cancelReservationMutation.mutate()}
                    disabled={cancelReservationMutation.isPending}
                    text={
                      cancelReservationMutation.isPending
                        ? t("classModal.leaving")
                        : t("classModal.leaveClass")
                    }
                    textSmall={true}
                  />
                )}
              </div>
            ) : isInWaitlist ? (
              <RedButton
                text={
                  deleteWaitlistMutation.isPending
                    ? t("classModal.leaving")
                    : t("classModal.leaveWaitlist")
                }
                textSmall={true}
                onClick={() => deleteWaitlistMutation.mutate()}
                disabled={deleteWaitlistMutation.isPending}
              />
            ) : isFull ? (
              <BlackButton
                text={
                  waitlistMutation.isPending
                    ? t("classModal.adding")
                    : t("classModal.joinWaitlist")
                }
                textSmall={true}
                onClick={() => waitlistMutation.mutate()}
                disabled={waitlistMutation.isPending || !currentStudent}
              />
            ) : (
              <div className="flex gap-3">
                <WhiteButton
                  type="button"
                  text={t("classModal.cancel")}
                  onClick={close}
                  textSmall={true}
                />

                <BlackButton
                  onClick={() => reservationMutation.mutate()}
                  disabled={reservationMutation.isPending || !currentStudent}
                  text={
                    reservationMutation.isPending
                      ? t("classModal.processing")
                      : t("classModal.joinClass")
                  }
                  textSmall={true}
                />
              </div>
            )
          ) : null}
        </>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <h2 className="text-2xl font-semibold text-center mb-6">
            {t("classModal.editTitle")}
          </h2>

          <div>
            <label className="block text-sm font-semibold mb-2">
              {t("classForm.activity")}
            </label>

            <select
              {...register("activityId")}
              className="rounded-lg w-full px-3 pt-1.75 pb-2 text-gray-600 cursor-pointer bg-[#f1eef3] border border-gray-400 outline-none focus:ring-[1.5px] focus:border-transparent transition-[border-color,box-shadow] duration-200"
            >
              <option value="">{t("classModal.selectActivity")}</option>

              {activities.map((activity) => (
                <option key={activity.id} value={activity.id}>
                  {activity.name}
                </option>
              ))}
            </select>

            {errors.activityId && (
              <p className="text-red-500 text-[13px] mt-1">
                {errors.activityId.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">
              {t("classForm.professor")}
            </label>

            <select
              {...register("professorId")}
              className="rounded-lg w-full px-3 pt-1.75 pb-2 text-gray-600 cursor-pointer bg-[#f1eef3] border border-gray-400 outline-none focus:ring-[1.5px] focus:border-transparent transition-[border-color,box-shadow] duration-200"
            >
              <option value="">{t("classModal.selectProfessor")}</option>

              {professors
                .filter((professor) => professor.isActive === true)
                .map((professor) => (
                  <option key={professor.id} value={professor.id}>
                    {professor.user.name} {professor.user.surname}
                  </option>
                ))}
            </select>

            {errors.professorId && (
              <p className="text-red-500 text-[13px] mt-1">
                {errors.professorId.message}
              </p>
            )}
          </div>

          {isTemplate ? (
            <div>
              <label className="block text-sm font-semibold mb-2">
                {t("classForm.day")}
              </label>

              <select
                {...register("dayOfWeek")}
                className="rounded-lg w-full px-3 pt-1.75 pb-2 text-gray-600 cursor-pointer bg-[#f1eef3] border border-gray-400 outline-none focus:ring-[1.5px] focus:border-transparent transition-[border-color,box-shadow] duration-200"
              >
                <option value="">{t("classModal.selectDay")}</option>
                <option value="1">{t("classForm.monday")}</option>
                <option value="2">{t("classForm.tuesday")}</option>
                <option value="3">{t("classForm.wednesday")}</option>
                <option value="4">{t("classForm.thursday")}</option>
                <option value="5">{t("classForm.friday")}</option>
                <option value="6">{t("classForm.saturday")}</option>
                <option value="0">{t("classForm.sunday")}</option>
              </select>

              {errors.dayOfWeek && (
                <p className="text-red-500 text-[13px] mt-1">
                  {errors.dayOfWeek.message}
                </p>
              )}
            </div>
          ) : (
            <FormInput
              label={t("classForm.date")}
              type="date"
              register={register("date")}
              error={errors.date}
            />
          )}

          <FormInput
            label={t("classModal.startTime")}
            type="time"
            register={register("startTime")}
            error={errors.startTime}
          />

          <FormInput
            label={t("classModal.endTime")}
            type="time"
            register={register("endTime")}
            error={errors.endTime}
          />

          <FormInput
            label={t("classForm.capacity")}
            type="number"
            register={register("maxCapacity")}
            error={errors.maxCapacity}
          />

          <div className="grid grid-cols-2 gap-3">
            <WhiteButton
              type="button"
              text={t("classModal.cancel")}
              onClick={() => setEditing(false)}
              textSmall={true}
            />

            <BlackButton
              text={
                updateMutation.isPending
                  ? t("classModal.updating")
                  : t("classModal.update")
              }
              type="submit"
              disabled={updateMutation.isPending}
              textSmall={true}
            />
          </div>
        </form>
      )}

      {confirmModal && (
        <ConfirmModal
          title={t("classModal.confirmTitle")}
          message={t("classModal.confirmMessage", {
            day: isTemplate
              ? formatDateWithDay(currentClass.dayOfWeek)
              : formatDateWithDay(currentClass.date),
            startTime: currentClass.startTime.slice(0, 5),
            endTime: currentClass.endTime.slice(0, 5),
          })}
          onConfirm={() => deleteMutation.mutate()}
          close={() => setConfirmModal(false)}
          isPending={deleteMutation.isPending}
        />
      )}

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

      {studentsModal && (
        <ClassStudentsModal
          currentClass={currentClass}
          tenantId={tenantId}
          maxCapacity={currentClass.maxCapacity}
          close={() => setStudentsModal(false)}
          formatDateWithDay={formatDateWithDay}
          decreaseReservationCount={decreaseReservationCount}
          increaseReservationCount={increaseReservationCount}
          isTemplate={isTemplate}
          onClassUpdated={(updatedClass) => {
            setCurrentClass(updatedClass);
          }}
        />
      )}
    </Modal>
  );
}
