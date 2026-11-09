import { useState } from "react";
import { formatMonthYear, getLocale } from "../../utils/formatting";
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
import { useTranslation } from "react-i18next";

export default function CopyClassTemplateWeekModal({
  tenantId,
  close,
  onCopied,
}) {
  const { t } = useTranslation();
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
        error?.response?.data?.message || t("copyTemplate.weekError");

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
        aria-label={t("common.close")}
        className="absolute top-4 right-4 text-gray-500 hover:text-black cursor-pointer"
      >
        <X size={20} />
      </button>

      <h2 className="text-2xl font-semibold mb-2">
        {t("copyTemplate.weekTitle")}
      </h2>

      <p className="text-gray-600 mb-6">
        {t("copyTemplate.weekDescription")}
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
              return date.toLocaleDateString(getLocale(), { weekday: "short" });
            },

            formatCaption: (date) => formatMonthYear(date),
          }}
          className="copy-day-picker border rounded-2xl shadow-md px-3 py-3"
        />
      </div>

      {selectedDate && (
        <p className="text-center text-gray-600 mt-4">
          {t("copyTemplate.selectedWeek")}{" "}
          <span className="font-semibold">
            {selectedDate.toLocaleDateString(getLocale())}
          </span>
        </p>
      )}

      <div className="grid grid-cols-2 mt-6 gap-3">
        <WhiteButton
          onClick={close}
          text={t("copyTemplate.cancel")}
          textSmall={true}
        />

        <BlackButton
          onClick={() => mutation.mutate()}
          text={t("copyTemplate.copy")}
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
          message={t("copyTemplate.weekCopied")}
          close={() => setSuccessModal(false)}
          isSuccesOrError
        />
      )}
    </Modal>
  );
}
