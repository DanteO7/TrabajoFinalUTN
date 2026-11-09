import { useTranslation } from "react-i18next";

export default function ReservationEmpty() {
  const { t } = useTranslation();
  return (
    <div className="mt-20 text-center">
      <h2 className="text-2xl font-semibold">
        {t("reservationUi.emptyTitle")}
      </h2>

      <p className="text-gray-500 mt-2">
        {t("reservationUi.emptyDescription")}
      </p>
    </div>
  );
}
