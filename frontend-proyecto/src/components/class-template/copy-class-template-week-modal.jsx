import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DayPicker } from "react-day-picker";
import "../../css/day-picker.css";
import "react-day-picker/dist/style.css";

import Modal from "../modals/modal";
import WhiteButton from "../buttons/white-button";
import BlackButton from "../buttons/black-button";
import ErrorModal from "../modals/error-modal";
import SuccessModal from "../modals/success-modal";
import { copyClassTemplateWeek } from "../../services/class-template";
import { X } from "lucide-react";

export default function CopyClassTemplateWeekModal({
  tenantId,
  close,
  onCopied,
}) {
  const queryClient = useQueryClient();

  const [selectedDate, setSelectedDate] = useState(null);

  const [errorModal, setErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [successModal, setSuccessModal] = useState(false);

  const mutation = useMutation({
    mutationFn: () => {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const day = String(selectedDate.getDate()).padStart(2, "0");

      const destinationMonday = `${year}-${month}-${day}`;

      return copyClassTemplateWeek(destinationMonday);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["getClasses", tenantId],
      });

      onCopied?.();

      setSuccessModal(true);

      setTimeout(() => {
        setSuccessModal(false);
        close();
      }, 1500);
    },

    onError: (error) => {
      const message =
        error?.response?.data?.message || "No se pudo copiar la semana.";

      setErrorMessage(message);
      setErrorModal(true);
    },
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <Modal open onClose={close}>
      <button
        onClick={close}
        className="absolute top-4 right-4 text-gray-500 hover:text-black cursor-pointer"
      >
        <X size={20} />
      </button>

      <h2 className="text-2xl font-semibold mb-2">Copiar semana</h2>

      <p className="text-gray-600 mb-6">
        Seleccioná el día a partir del cual querés copiar las clases de la
        semana modelo. Se copiarán las clases de ese día y los siguientes,
        respetando los días y horarios originales. Se omitirán los días
        anteriores y las clases cuyos horarios ya hayan pasado.
      </p>

      <div className="flex justify-center">
        <DayPicker
          mode="single"
          weekStartsOn={1}
          selected={selectedDate}
          defaultMonth={today}
          disabled={{
            before: today,
          }}
          onSelect={(date) => {
            if (date) {
              setSelectedDate(date);
            }
          }}
          formatters={{
            formatWeekdayName: (date) => {
              const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

              return days[date.getDay()];
            },

            formatCaption: (date) => {
              const months = [
                "Enero",
                "Febrero",
                "Marzo",
                "Abril",
                "Mayo",
                "Junio",
                "Julio",
                "Agosto",
                "Septiembre",
                "Octubre",
                "Noviembre",
                "Diciembre",
              ];

              return `${months[date.getMonth()]} ${date.getFullYear()}`;
            },
          }}
          className="copy-day-picker border rounded-2xl shadow-md px-3 py-3"
        />
      </div>

      {selectedDate && (
        <p className="text-center text-gray-600 mt-4">
          Semana seleccionada desde:{" "}
          <span className="font-semibold">
            {selectedDate.toLocaleDateString("es-AR")}
          </span>
        </p>
      )}

      <div className="grid grid-cols-2 mt-6 gap-3">
        <WhiteButton onClick={close} text="Cancelar" textSmall={true} />

        <BlackButton
          onClick={() => mutation.mutate()}
          text="Copiar"
          textSmall={true}
          disabled={!selectedDate || mutation.isPending}
        />
      </div>

      {errorModal && (
        <ErrorModal
          message={errorMessage}
          close={() => setErrorModal(false)}
          isSuccesOrError
        />
      )}

      {successModal && (
        <SuccessModal
          message="Semana copiada correctamente"
          close={() => setSuccessModal(false)}
          isSuccesOrError
        />
      )}
    </Modal>
  );
}
