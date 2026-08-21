import { X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import Modal from "../modals/modal";
import ErrorModal from "../modals/error-modal";
import SuccessModal from "../modals/success-modal";

import { deleteReservation } from "../../services/reservation";
import ConfirmModal from "../modals/confirm-modal";
import RedButton from "../buttons/red-button";
import WhiteButton from "../buttons/white-button";

export default function ReservationModal({ reservation, tenantId, close }) {
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

    const dayName = date.toLocaleDateString("es-AR", { weekday: "long" });
    const dateFormatted = date.toLocaleDateString("es-AR");

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

      setSuccessMessage("Reserva cancelada correctamente");
      setSuccessModal(true);

      setTimeout(() => {
        close();
      }, 2500);
    },

    onError: (error) => {
      const data = error?.response?.data;

      let msg = "Ocurrió un error";

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

      <h2 className="text-2xl font-semibold mb-2">{classItem.activityName}</h2>

      <p className="text-gray-600 mb-6">
        {classItem.professor.user.name} {classItem.professor.user.surname}
      </p>

      <div className="space-y-4">
        <div className="bg-[#efefef] rounded-xl p-4">
          <p className="text-sm text-gray-600 mb-1">Estado</p>

          <span
            className={`rounded-full px-3 py-1 text-sm ${
              reservation.reservationStatus === "Completed"
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {reservation.reservationStatus === "Completed"
              ? "Completada"
              : "Pendiente"}
          </span>
        </div>

        <div className="bg-[#efefef] rounded-xl p-4">
          <p className="text-sm text-gray-600 mb-1">Fecha</p>

          <p className="font-semibold">{formatDateWithDay(classItem.date)}</p>
        </div>

        <div className="bg-[#efefef] rounded-xl p-4">
          <p className="text-sm text-gray-600 mb-1">Horario</p>

          <p className="font-semibold">
            {classItem.startTime.slice(0, 5)} - {classItem.endTime.slice(0, 5)}
          </p>
        </div>

        <div className="bg-[#efefef] rounded-xl p-4">
          <p className="text-sm text-gray-600 mb-1">Actividad</p>

          <p className="font-semibold">{classItem.activityName}</p>
        </div>

        <div className="bg-[#efefef] rounded-xl p-4">
          <p className="text-sm text-gray-600 mb-1">Profesor</p>

          <p className="font-semibold">
            {classItem.professor.user.name} {classItem.professor.user.surname}
          </p>
        </div>
      </div>

      {canCancel && (
        <div className="mt-8">
          <RedButton
            text={
              deleteMutation.isPending ? "Saliendo..." : "Salir de la clase"
            }
            onClick={() => setConfirmModal(true)}
            disabled={deleteMutation.isPending}
            textSmall={true}
          />
        </div>
      )}

      {confirmModal && (
        <ConfirmModal
          title="Salir de esta clase?"
          message={`Estás por salir de la clase del dia ${formatDateWithDay(classItem.date)} a las ${classItem.startTime.slice(0, 5)} - ${classItem.endTime.slice(0, 5)}.`}
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
