import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import MainLayout from "../../layouts/main-layout";

import { useAuthStore } from "../../store/auth-store";
import { useTenantStore } from "../../store/tenant-store";

import { getStudentByUser } from "../../services/student";
import { getReservationsByStudentId } from "../../services/reservation";

import ReservationCard from "../../components/reservations/reservation-card";
import ReservationModal from "../../components/reservations/reservation-modal";
import ReservationFilter from "../../components/reservations/reservation-filter";
import ReservationEmpty from "../../components/reservations/reservation-empty";

import Loader from "../../components/loading";
import { useLocation } from "wouter";
import { IoArrowBack } from "react-icons/io5";

export default function Reservations({ tenantId }) {
  const [, setLocation] = useLocation();

  const { user } = useAuthStore();

  const [selectedReservation, setSelectedReservation] = useState(null);
  const [filter, setFilter] = useState("pending");

  const userRoles = useTenantStore(
    (state) => state.userRolesInTenant[tenantId],
  );

  const isStudent = userRoles?.roles?.includes("Student");

  const { data: student } = useQuery({
    queryKey: ["getStudentByUser", tenantId],
    queryFn: () => getStudentByUser(tenantId),
    enabled: isStudent && !!user,
  });

  const { data: reservations = [], isLoading } = useQuery({
    queryKey: ["getReservationsByStudentId", student?.id],
    queryFn: () => getReservationsByStudentId(student.id),
    enabled: !!student,
  });

  const filteredReservations = useMemo(() => {
    let data = [...reservations];

    if (filter === "pending") {
      data = data.filter((r) => r.reservationStatus === "Pending");
    }

    if (filter === "completed") {
      data = data.filter((r) => r.reservationStatus === "Completed");
    }

    data.sort((a, b) => {
      const dateA = new Date(`${a.class.date}T${a.class.startTime}`);

      const dateB = new Date(`${b.class.date}T${b.class.startTime}`);

      return dateA - dateB;
    });

    return data;
  }, [reservations, filter]);

  return (
    <MainLayout>
      <div className="w-full max-w-6xl mt-12">
        <button
          onClick={() => setLocation(`/tu-espacio/${tenantId}`)}
          className="text-gray-500 hover:text-black transition flex items-center gap-2 mb-6 cursor-pointer"
        >
          <IoArrowBack color="fc697b" />
          Volver
        </button>
        <div className="flex justify-between items-center flex-wrap gap-5">
          <div>
            <h1 className="text-4xl min-[900px]:text-5xl font-bold">
              Mis reservas
            </h1>

            <p className="text-gray-500 mt-2">
              Todas las clases a las que estás anotado.
            </p>
          </div>

          <ReservationFilter filter={filter} setFilter={setFilter} />
        </div>

        {isLoading ? (
          <div className="flex justify-center mt-20">
            <Loader />
          </div>
        ) : filteredReservations.length === 0 ? (
          <ReservationEmpty />
        ) : (
          <div className="grid gap-6 mt-10 min-[900px]:grid-cols-2">
            {filteredReservations.map((reservation) => (
              <ReservationCard
                key={reservation.id}
                reservation={reservation}
                onClick={() => setSelectedReservation(reservation)}
              />
            ))}
          </div>
        )}

        {selectedReservation && (
          <ReservationModal
            reservation={selectedReservation}
            tenantId={tenantId}
            close={() => setSelectedReservation(null)}
          />
        )}
      </div>
    </MainLayout>
  );
}
