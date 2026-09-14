import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import MainLayout from "../layouts/main-layout";
import Loading from "../components/loading";
import PaymentCard from "../components/payments/payment-card";
import { getMyPayments } from "../services/payment";

const MONTHS = [
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

export default function MyPayments() {
  const now = new Date();

  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);

  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const {
    data: myPayments = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["myPayments", selectedYear, selectedMonth],
    queryFn: () => getMyPayments(selectedYear, selectedMonth),
  });

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
        <div>
          <h1 className="text-4xl min-[900px]:text-5xl font-bold">Mis pagos</h1>

          <p className="text-gray-500 mt-3">
            Consultá el historial de todos tus pagos.
          </p>
        </div>

        <div className="flex items-center justify-center gap-4 mt-10">
          <button
            onClick={goToPreviousMonth}
            className="p-2 rounded-full transition cursor-pointer"
            aria-label="Mes anterior"
          >
            <FaChevronLeft size={22} color="fc697b" />
          </button>

          <div className="min-w-47.5 text-center">
            <p className="max-[900px]:text-[22px] text-[27px] font-semibold">
              {MONTHS[selectedMonth - 1]} {selectedYear}
            </p>
          </div>

          <button
            onClick={goToNextMonth}
            className="p-2 rounded-full transition cursor-pointer"
            aria-label="Mes siguiente"
          >
            <FaChevronRight size={22} color="fc697b" />
          </button>
        </div>

        {isLoading ? (
          <Loading />
        ) : isError ? (
          <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-700 mt-8">
            No se pudieron cargar tus pagos.
          </div>
        ) : (
          <>
            <div className="mt-8">
              <h2 className="text-2xl font-semibold">Historial de pagos</h2>

              <p className="text-gray-500 mt-1">
                {myPayments.length} {myPayments.length === 1 ? "pago" : "pagos"}{" "}
                en {MONTHS[selectedMonth - 1].toLowerCase()} de {selectedYear}.
              </p>
            </div>

            <div className="grid gap-6 mt-8 sm:grid-cols-2 xl:grid-cols-3">
              {myPayments.length > 0 ? (
                myPayments.map((p) => (
                  <PaymentCard key={p.id} payment={p} showUser={false} />
                ))
              ) : (
                <div className="sm:col-span-2 xl:col-span-3 text-center py-12 text-gray-500">
                  No realizaste pagos en{" "}
                  {MONTHS[selectedMonth - 1].toLowerCase()} de {selectedYear}.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}
