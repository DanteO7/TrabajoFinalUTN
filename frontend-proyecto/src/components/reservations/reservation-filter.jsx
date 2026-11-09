import { useTranslation } from "react-i18next";

export default function ReservationFilter({ filter, setFilter }) {
  const { t } = useTranslation();
  return (
    <div className="flex gap-3 flex-wrap">
      <button
        onClick={() => setFilter("all")}
        className={`cursor-pointer px-4 py-2 rounded-lg border transition ${
          filter === "all" ? "bg-[#333] text-white" : ""
        }`}
      >
        {t("reservationUi.filters.all")}
      </button>

      <button
        onClick={() => setFilter("pending")}
        className={`cursor-pointer px-4 py-2 rounded-lg border transition ${
          filter === "pending" ? "bg-[#333] text-white" : ""
        }`}
      >
        {t("reservationUi.filters.pending")}
      </button>

      <button
        onClick={() => setFilter("completed")}
        className={`cursor-pointer px-4 py-2 rounded-lg border transition ${
          filter === "completed" ? "bg-[#333] text-white" : ""
        }`}
      >
        {t("reservationUi.filters.completed")}
      </button>
    </div>
  );
}
