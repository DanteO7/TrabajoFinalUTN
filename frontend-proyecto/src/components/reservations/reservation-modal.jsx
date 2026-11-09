import { X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { getLocale } from "../../utils/formatting";
import { useTranslation } from "react-i18next";

import Modal from "../modals/modal";
import ErrorModal from "../modals/error-modal";
import SuccessModal from "../modals/success-modal";

import { deleteReservation } from "../../services/reservation";
import ConfirmModal from "../modals/confirm-modal";
import RedButton from "../buttons/red-button";

export default function ReservationModal({ reservation, tenantId, close }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [backendError, setBackendError] = useState();
  const [errorModal, setErrorModal] = useState(false);

  const [successMessage, setSuccessMessage] = useState();
  const [successModal, setSuccessModal] = useState(false);

  const [confirmModal, setConfirmModal] = useState(false);

  const classItem = reservation.class;

  const canCancel = reservation.reservationStatus === "Pending";

  const formatDateWithDay = (dateString) => {
    const [year, month, day] = dateString.split("T")[0].split("-");
    const date = new Date(year, month - 1, day);

    const dayName = date.toLocaleDateString(getLocale(), { weekday: "long" });
    const dateFormatted = date.toLocaleDateString(getLocale());

    return `${dayName.charAt(0).toUpperCase() + dayName.slice(1)} ${dateFormatted}`;
  };

  const deleteMutation = useMutation({
    mutationFn: () => deleteReservation(reservation.id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["getReservationsByStudentId"],
      });

      queryClient.invalidateQueries({
        queryKey: ["getClasses", tenantId],
      });
      setConfirmModal(false);

      setSuccessMessage(t("reservationUi.cancelSuccess"));
      setSuccessModal(true);

      setTimeout(() => {
        close();
      }, 2500);
    },

    onError: (error) => {
      const data = error?.response?.data;

      let msg = t("reservationUi.error");

      if (typeof data === "string") msg = data;
      else if (data?.errors)
        msg = Object.values(data.errors).flat().join(" - ");
      else if (data?.message) msg = data.message;

      setConfirmModal(false);
      setBackendError(msg);
      setErrorModal(true);
    },
  });

  return (
    <Modal open onClose={close}>
      <button
        onClick={close}
        className="absolute top-4 right-4 text-gray-500 hover:text-black transition duration-200 cursor-pointer"
      >
        <X size={20} />
      </button>

      <h2 className="text-2xl font-semibold mb-3">{classItem.activityName}</h2>

      <div className="space-y-4">
        <div className="bg-[#f4f0f5] rounded-lg border border-gray-400 shadow-md p-4">
          <p className="text-sm text-gray-600 mb-1">
            {t("reservationUi.status")}
          </p>

          <span
            className={`rounded-full px-3 py-1 text-sm ${
              reservation.reservationStatus === "Completed"
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {reservation.reservationStatus === "Completed"
              ? t("reservationUi.filters.completed")
              : t("reservationUi.filters.pending")}
          </span>
        </div>

        <div className="bg-[#f4f0f5] rounded-lg border border-gray-400 shadow-md p-4">
          <p className="text-sm text-gray-600 mb-1">
            {t("reservationUi.date")}
          </p>

          <p className="font-semibold">{formatDateWithDay(classItem.date)}</p>
        </div>

        <div className="bg-[#f4f0f5] rounded-lg border border-gray-400 shadow-md p-4">
          <p className="text-sm text-gray-600 mb-1">
            {t("reservationUi.schedule")}
          </p>

          <p className="font-semibold">
            {classItem.startTime.slice(0, 5)} - {classItem.endTime.slice(0, 5)}
          </p>
        </div>

        <div className="bg-[#f4f0f5] rounded-lg border border-gray-400 shadow-md p-4">
          <p className="text-sm text-gray-600 mb-1">
            {t("reservationUi.activity")}
          </p>

          <p className="font-semibold">{classItem.activityName}</p>
        </div>

        <div className="bg-[#f4f0f5] rounded-lg border border-gray-400 shadow-md p-4">
          <p className="text-sm text-gray-600 mb-1">
            {t("reservationUi.professor")}
          </p>

          <p className="font-semibold">
            {classItem.professor.user.name} {classItem.professor.user.surname}
          </p>
        </div>
      </div>

      {canCancel && (
        <div className="mt-8">
          <RedButton
            text={
              deleteMutation.isPending
                ? t("reservationUi.leaving")
                : t("reservationUi.leaveClass")
            }
            onClick={() => setConfirmModal(true)}
            disabled={deleteMutation.isPending}
            textSmall={true}
          />
        </div>
      )}

      {confirmModal && (
        <ConfirmModal
          title={t("reservationUi.leaveTitle")}
          message={t("reservationUi.leaveConfirmation", {
            date: formatDateWithDay(classItem.date),
            startTime: classItem.startTime.slice(0, 5),
            endTime: classItem.endTime.slice(0, 5),
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
