import { X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import Modal from "../modals/modal";
import ErrorModal from "../modals/error-modal";
import SuccessModal from "../modals/success-modal";

import { deleteReservation } from "../../services/reservation";
import ConfirmModal from "../modals/confirm-modal";

export default function ReservationModal({ reservation, tenantId, close }) {
  const queryClient = useQueryClient();

  const [backendError, setBackendError] = useState();
  const [errorModal, setErrorModal] = useState(false);

  const [successMessage, setSuccessMessage] = useState();
  const [successModal, setSuccessModal] = useState(false);

  const [confirmModal, setConfirmModal] = useState(false);

  const classItem = reservation.class;

  const canCancel = reservation.reservationStatus === "Pending";

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

  var date = new Date(classItem.date).toLocaleDateString("es-AR");

  return (
    <Modal open onClose={close}>
      <button
        onClick={close}
        className="absolute top-4 right-4 text-gray-500 hover:text-black transition duration-200 cursor-pointer"
      >
        <X size={20} />
      </button>

      <h2 className="text-2xl font-semibold mb-2">{classItem.activity.name}</h2>

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

          <p className="font-semibold">{date}</p>
        </div>

        <div className="bg-[#efefef] rounded-xl p-4">
          <p className="text-sm text-gray-600 mb-1">Horario</p>

          <p className="font-semibold">
            {classItem.startTime.slice(0, 5)} - {classItem.endTime.slice(0, 5)}
          </p>
        </div>

        <div className="bg-[#efefef] rounded-xl p-4">
          <p className="text-sm text-gray-600 mb-1">Actividad</p>

          <p className="font-semibold">{classItem.activity.name}</p>
        </div>

        <div className="bg-[#efefef] rounded-xl p-4">
          <p className="text-sm text-gray-600 mb-1">Profesor</p>

          <p className="font-semibold">
            {classItem.professor.user.name} {classItem.professor.user.surname}
          </p>
        </div>

        <div className="bg-[#efefef] rounded-xl p-4">
          <p className="text-sm text-gray-600 mb-1">Cupos</p>

          <p className="font-semibold">
            {classItem.reservationsCount} / {classItem.maxCapacity}
          </p>
        </div>
      </div>

      {canCancel && (
        <button
          onClick={() => setConfirmModal(true)}
          disabled={deleteMutation.isPending}
          className="w-full mt-8 bg-red-600 text-white rounded-xl py-3 hover:bg-red-700 disabled:opacity-50 cursor-pointer transition"
        >
          {deleteMutation.isPending ? "Cancelando..." : "Cancelar reserva"}
        </button>
      )}

      {confirmModal && (
        <ConfirmModal
          title="¿Cancelar esta reserva?"
          message={`Estás por cancelar la reserva del dia ${date} a las ${classItem.startTime.slice(0, 5)} - ${classItem.endTime.slice(0, 5)}.`}
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
