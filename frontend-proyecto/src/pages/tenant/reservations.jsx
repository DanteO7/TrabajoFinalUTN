import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import MainLayout from "../../layouts/main-layout";
import { useAuthStore } from "../../store/auth-store";
import { useHasPermission } from "../../store/tenant-store";
import { getStudentByUser } from "../../services/student";
import { getReservationsByStudentId } from "../../services/reservation";
import ReservationCard from "../../components/reservations/reservation-card";
import ReservationModal from "../../components/reservations/reservation-modal";
import ReservationFilter from "../../components/reservations/reservation-filter";
import { useLocation } from "wouter";
import { IoArrowBack } from "react-icons/io5";
import BlackButton from "../../components/buttons/black-button";
import { Link } from "wouter";
import Loading from "../../components/loading";
import { useTranslation } from "react-i18next";
import { formatMonthYear, formatNumber } from "../../utils/formatting";

function MonthSelector({ monthYear, onPrevious, onNext, t }) {
  return (
    <div className="flex items-center justify-center gap-4 mt-10">
      <button
        onClick={onPrevious}
        className="p-2 rounded-full transition cursor-pointer"
        aria-label={t("adminPayments.previousMonth")}
      >
        <FaChevronLeft size={22} color="#fc697b" />
      </button>

      <div className="min-w-47.5 text-center">
        <p className="max-[900px]:text-[22px] text-[27px] font-semibold">
          {monthYear}
        </p>
      </div>

      <button
        onClick={onNext}
        className="p-2 rounded-full transition cursor-pointer"
        aria-label={t("adminPayments.nextMonth")}
      >
        <FaChevronRight size={22} color="#fc697b" />
      </button>
    </div>
  );
}

export default function Reservations({ tenantId }) {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { user } = useAuthStore();
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [filter, setFilter] = useState("pending");
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const canReadReservations = useHasPermission(tenantId, "RESERVATION_READ");
  const monthDate = new Date(selectedYear, selectedMonth - 1, 1);
  const monthYear = formatMonthYear(monthDate);

  const { data: student } = useQuery({
    queryKey: ["getStudentByUser", tenantId],
    queryFn: () => getStudentByUser(tenantId),
    enabled: canReadReservations && !!user,
  });

  const {
    data: allReservations = [],
    isLoading: isLoadingAllReservations,
  } = useQuery({
    queryKey: ["getReservationsByStudentId", student?.id],
    queryFn: () => getReservationsByStudentId(student.id),
    enabled: !!student && filter === "pending",
  });

  const {
    data: monthlyAllReservations = [],
    isLoading: isLoadingMonthlyAllReservations,
  } = useQuery({
    queryKey: [
      "getAllReservationsByStudentIdAndMonth",
      student?.id,
      selectedYear,
      selectedMonth,
    ],
    queryFn: () =>
      getReservationsByStudentId(
        student.id,
        selectedMonth,
        selectedYear,
        true,
      ),
    enabled: !!student && filter === "all",
  });

  const {
    data: completedReservations = [],
    isLoading: isLoadingCompletedReservations,
  } = useQuery({
    queryKey: [
      "getCompletedReservationsByStudentId",
      student?.id,
      selectedYear,
      selectedMonth,
    ],
    queryFn: () =>
      getReservationsByStudentId(student.id, selectedMonth, selectedYear),
    enabled: !!student && filter === "completed",
  });

  const reservations =
    filter === "completed"
      ? completedReservations
      : filter === "all"
        ? monthlyAllReservations
        : allReservations;
  const isLoading =
    filter === "completed"
      ? isLoadingCompletedReservations
      : filter === "all"
        ? isLoadingMonthlyAllReservations
        : isLoadingAllReservations;

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

  const goToPreviousMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((year) => year - 1);
    } else {
      setSelectedMonth((month) => month - 1);
    }
  };

  const goToNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((year) => year + 1);
    } else {
      setSelectedMonth((month) => month + 1);
    }
  };

  return (
    <MainLayout>
      <div className="w-full max-w-6xl mt-12">
        <button
          onClick={() => setLocation(`/mi-espacio/${tenantId}`)}
          className="text-gray-500 hover:text-black transition flex items-center gap-2 mb-6 cursor-pointer"
        >
          <IoArrowBack color="#fc697b" />
          {t("common.back")}
        </button>

        <div className="flex justify-between items-center flex-wrap gap-5">
          <div>
            <h1 className="text-4xl min-[900px]:text-5xl font-bold">
              {t("tenantPages.reservations.title")}
            </h1>

            <p className="text-gray-500 mt-2">
              {t("tenantPages.reservations.description")}
            </p>

            {student && (
              <p className="text-gray-500 mt-2">
                {t("tenantPages.reservations.availableClasses")}:{" "}
                <span className="font-semibold text-[#444]">
                  {formatNumber(student.remainingClasses)}/
                  {formatNumber(student.studentPlan.classesPerMonth)}
                </span>
              </p>
            )}
          </div>

          <ReservationFilter filter={filter} setFilter={setFilter} />
        </div>

        {(filter === "all" || filter === "completed") && (
          <MonthSelector
            monthYear={monthYear}
            onPrevious={goToPreviousMonth}
            onNext={goToNextMonth}
            t={t}
          />
        )}

        {isLoading ? (
          <div className="flex justify-center mt-20">
            <Loading />
          </div>
        ) : filteredReservations.length === 0 ? (
          <div className="mt-20 flex flex-col justify-center items-center gap-4 text-center">
            <h2 className="text-2xl font-semibold">
              {t("reservationUi.emptyTitle")}
            </h2>

            <p className="text-gray-500">
              {t("reservationUi.emptyDescription")}
            </p>
            <Link href={`/mi-espacio/${tenantId}/clases`}>
              <BlackButton
                text={t("tenantPages.reservations.goToClasses")}
                wfit
                textSmall
              />
            </Link>
          </div>
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
