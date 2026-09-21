import { IoArrowBack } from "react-icons/io5";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { getTenantPaymentsForAdmin } from "../services/payment";
import MainLayout from "../layouts/main-layout";
import Loading from "../components/loading";
import PaymentCard from "../components/payments/payment-card";
import BlackButton from "../components/buttons/black-button";
import PaymentForm from "../components/payments/payment-form";

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

export default function AppPayments() {
  const [, setLocation] = useLocation();

  const now = new Date();

  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);

  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const [openCreateModal, setOpenCreateModal] = useState(false);

  const {
    data: payments = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["getTenantPaymentsForAdmin", selectedYear, selectedMonth],
    queryFn: () => getTenantPaymentsForAdmin(selectedYear, selectedMonth),
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
        <button
          onClick={() => setLocation("/admin")}
          className="text-gray-500 hover:text-black transition flex items-center gap-2 mb-6 cursor-pointer"
        >
          <IoArrowBack color="fc697b" />
          Volver
        </button>

        {isError ? (
          <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-700">
            Esta página no existe o no tienes acceso.
          </div>
        ) : (
          <>
            <div>
              <h1 className="text-4xl min-[900px]:text-5xl font-bold">Pagos</h1>

              <p className="text-gray-500 mt-3">
                Consultá los pagos realizados por los negocios a TurnoFácil.
              </p>
            </div>

            {isLoading ? (
              <Loading />
            ) : (
              <>
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
                <div className="flex flex-col min-[700px]:flex-row min-[700px]:items-center min-[700px]:justify-between gap-4 mt-8">
                  <div>
                    <h2 className="text-2xl font-semibold">
                      Pagos de los negocios
                    </h2>

                    <p className="text-gray-500 mt-1">
                      {payments.length}{" "}
                      {payments.length === 1 ? "pago" : "pagos"} en{" "}
                      {MONTHS[selectedMonth - 1].toLowerCase()} de{" "}
                      {selectedYear}.
                    </p>
                  </div>
                  <BlackButton
                    text="+ Registrar pago"
                    onClick={() => setOpenCreateModal(true)}
                    textSmall={true}
                    wfit={true}
                  />
                </div>

                <div className="grid gap-6 mt-8 sm:grid-cols-2 xl:grid-cols-3">
                  {payments.length > 0 ? (
                    payments.map((payment) => (
                      <PaymentCard
                        key={payment.id}
                        payment={payment}
                        tenantId={payment.tenantId}
                        isAdmin
                      />
                    ))
                  ) : (
                    <div className="sm:col-span-2 xl:col-span-3 text-center py-12 text-gray-500">
                      No hay pagos registrados en{" "}
                      {MONTHS[selectedMonth - 1].toLowerCase()} de{" "}
                      {selectedYear}.
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
      {openCreateModal && (
        <PaymentForm close={() => setOpenCreateModal(false)} isAdmin />
      )}
    </MainLayout>
  );
}
