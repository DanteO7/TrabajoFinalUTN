import { CalendarDays, Clock3, CheckCircle2 } from "lucide-react";

export default function ReservationCard({ reservation, onClick }) {
  const completed = reservation.reservationStatus === "Completed";

  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-xl border p-5 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-semibold">
            {reservation.class.activity?.name}
          </h3>

          <p className="text-gray-700 font-semibold text-xl">
            {reservation.class.professor.user.name}{" "}
            {reservation.class.professor.user.surname}
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-sm border ${
            completed
              ? "border-gray-600 text-gray-600"
              : "border-green-600 text-green-600"
          }`}
        >
          {completed ? "Completada" : "Pendiente"}
        </span>
      </div>

      <div className="flex flex-col gap-2 mt-5 text-gray-700">
        <div className="flex items-center gap-2">
          <CalendarDays size={18} />
          {new Date(reservation.class.date).toLocaleDateString("es-AR")}
        </div>

        <div className="flex items-center gap-2">
          <Clock3 size={18} />
          {reservation.class.startTime.slice(0, 5)} -{" "}
          {reservation.class.endTime.slice(0, 5)}
        </div>

        <div className="flex items-center gap-2">
          <CheckCircle2 size={18} />
          {reservation.class.reservationsCount}/{reservation.class.maxCapacity}{" "}
          alumnos
        </div>
      </div>
    </div>
  );
}
