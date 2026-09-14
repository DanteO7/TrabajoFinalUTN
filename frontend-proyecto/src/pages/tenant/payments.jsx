import { IoArrowBack } from "react-icons/io5";
import { Link as LinkIcon } from "lucide-react";
import MainLayout from "../../layouts/main-layout";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  connectMercadoPago,
  getMercadoPagoStatus,
} from "../../services/mercado-pago";
import Loading from "../../components/loading";
import BlackButton from "../../components/buttons/black-button";
import { useTenantStore } from "../../store/tenant-store";
import {
  getTenantPayments,
  getMyPaymentsByTenant,
  getMyTenantPaymentStatus,
  createMercadoPagoStudentPayment,
} from "../../services/payment";
import PaymentForm from "../../components/payments/payment-form";
import { SiMercadopago } from "react-icons/si";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import PaymentCard from "../../components/payments/payment-card";
import { useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import PaymentDataModal from "../../components/payments/payment-data-modal";

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

export default function Payments({ tenantId }) {
  const [, setLocation] = useLocation();
  const isSmallScreen = useMediaQuery("(min-width: 900px)");

  const [openCreateModal, setOpenCreateModal] = useState(false);
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [openModal, setOpenModal] = useState(false);

  const hasPermission = useTenantStore((state) => state.hasPermission);

  const userTenantPermissions = useTenantStore(
    (state) => state.userPermissionsInTenant[tenantId],
  );

  const rolesLoaded = !!userTenantPermissions;

  const hasAccessToTenant = userTenantPermissions?.hasAccessToTenant === true;

  const canManageBusiness = hasPermission(tenantId, "PAYMENT_CREATE");

  const {
    data: tenantPayments = [],
    isLoading: isLoadingTenantPayments,
    isError: isTenantPaymentsError,
  } = useQuery({
    queryKey: ["tenantPayments", tenantId, selectedYear, selectedMonth],
    queryFn: () => getTenantPayments(tenantId, selectedYear, selectedMonth),
    enabled: rolesLoaded && hasAccessToTenant && canManageBusiness,
  });

  const {
    data: myTenantPayments = [],
    isLoading: isLoadingMyTenantPayments,
    isError: isMyTenantPaymentsError,
  } = useQuery({
    queryKey: ["myTenantPayments", tenantId, selectedYear, selectedMonth],
    queryFn: () => getMyPaymentsByTenant(tenantId, selectedYear, selectedMonth),
    enabled: rolesLoaded && hasAccessToTenant && !canManageBusiness,
  });

  const {
    data: myTenantStatus,
    isLoading: isLoadingMyTenantStatus,
    isError: isMyTenantStatusError,
  } = useQuery({
    queryKey: ["myTenantStatus", tenantId],
    queryFn: () => getMyTenantPaymentStatus(tenantId),
    enabled: rolesLoaded && hasAccessToTenant && !canManageBusiness,
  });

  const { data: mercadoPagoStatus, isLoading: isLoadingMercadoPago } = useQuery(
    {
      queryKey: ["mercadoPagoStatus", tenantId],
      queryFn: () => getMercadoPagoStatus(tenantId),
      enabled: rolesLoaded && hasAccessToTenant && canManageBusiness,
    },
  );

  const tenantName =
    myTenantStatus?.tenantName || tenantPayments[0]?.tenantName || "Mi negocio";

  const isLoading = canManageBusiness
    ? isLoadingTenantPayments || isLoadingMercadoPago
    : isLoadingMyTenantPayments || isLoadingMyTenantStatus;

  const isError = canManageBusiness
    ? isTenantPaymentsError
    : isMyTenantPaymentsError || isMyTenantStatusError;

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

  const mercadoPagoMutation = useMutation({
    mutationFn: () => createMercadoPagoStudentPayment(tenantId),
    onSuccess: (data) => {
      window.location.href = data.checkoutUrl;
    },
    onError: (error) => {
      console.error("Error al crear el pago con Mercado Pago:", error);
    },
  });

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

        {!rolesLoaded ? (
          <Loading />
        ) : !hasAccessToTenant ? (
          <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-700">
            Esta página no existe o no tienes acceso.
          </div>
        ) : isError ? (
          <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-700">
            Esta página no existe o no tienes acceso.
          </div>
        ) : (
          <>
            <div>
              <h1 className="text-4xl min-[900px]:text-5xl font-bold">Pagos</h1>

              <p className="text-gray-500 mt-3">
                {canManageBusiness
                  ? "Gestioná los pagos de tu negocio y consultá los pagos que realizaste."
                  : "Consultá tus pagos y el estado de tu cuota."}
              </p>
            </div>

            {isLoading ? (
              <Loading />
            ) : (
              <>
                {canManageBusiness && (
                  <>
                    <div className="mt-8 rounded-xl border p-6 shadow-md">
                      <div className="flex flex-col min-[700px]:flex-row items-center min-[700px]:justify-between gap-5">
                        <div className="flex gap-5 items-center">
                          <SiMercadopago
                            className="hidden min-[900px]:flex"
                            size={40}
                          />

                          <div>
                            <div className="flex gap-3 items-center">
                              <SiMercadopago
                                className="flex min-[900px]:hidden"
                                size={40}
                              />

                              <h2 className="text-xl font-semibold">
                                Mercado Pago
                              </h2>
                            </div>

                            {mercadoPagoStatus?.connected ? (
                              <p className="text-green-600 mt-1">
                                Cuenta conectada correctamente
                              </p>
                            ) : (
                              <p className="text-gray-500 mt-1">
                                Conectá tu cuenta para recibir pagos mediante
                                Mercado Pago.
                              </p>
                            )}
                          </div>
                        </div>

                        <BlackButton
                          text={
                            mercadoPagoStatus?.connected
                              ? "Cuenta vinculada"
                              : "Vincular Mercado Pago"
                          }
                          img={<LinkIcon size={18} />}
                          textSmall={true}
                          wfit={isSmallScreen}
                          disabled={mercadoPagoStatus?.connected}
                          onClick={() => connectMercadoPago(tenantId)}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col min-[700px]:flex-row min-[700px]:items-center min-[700px]:justify-between gap-4 mt-8">
                      <div>
                        <h2 className="text-2xl font-semibold">
                          Pagos recibidos
                        </h2>

                        <p className="text-gray-500 mt-1">
                          {tenantPayments.length}{" "}
                          {tenantPayments.length === 1 ? "pago" : "pagos"} en{" "}
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
                      {tenantPayments.length > 0 ? (
                        tenantPayments.map((p) => (
                          <PaymentCard
                            key={p.id}
                            payment={p}
                            showUser={true}
                            tenantId={tenantId}
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

                {!canManageBusiness && (
                  <>
                    <div className="mt-8 rounded-xl border p-6 shadow-md">
                      <div className="flex flex-col min-[700px]:flex-row min-[700px]:items-center min-[700px]:justify-between gap-6">
                        <div>
                          <h2 className="text-2xl font-semibold">
                            {tenantName}
                          </h2>

                          <p className="text-gray-500 mt-1">
                            {myTenantStatus?.planName}
                          </p>
                        </div>

                        <div className="min-[700px]:text-right">
                          <p className="text-gray-500">Cuota mensual</p>

                          <p className="text-2xl font-semibold">
                            ${myTenantStatus?.planPrice}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 rounded-xl border p-6 shadow-md">
                      <h2 className="text-xl font-semibold">
                        Estado de la cuota
                      </h2>

                      <div className="mt-4">
                        {myTenantStatus?.monthlyFeeStatus === "Paid" ? (
                          <div>
                            <p className="text-green-600 font-semibold">
                              Cuota paga
                            </p>

                            <p className="text-gray-500 mt-1">
                              Tu cuota de este mes está al día.
                            </p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-red-600 font-semibold">
                              Cuota pendiente
                            </p>

                            <p className="text-gray-500 mt-1">
                              Tenés una cuota pendiente de pago.
                            </p>

                            <div className="flex max-[550px]:flex-col gap-3 mt-5 min-[600px]:max-w-116">
                              {myTenantStatus?.mercadoPagoConnected && (
                                <BlackButton
                                  text={
                                    mercadoPagoMutation.isPending
                                      ? "Generando pago..."
                                      : "Pagar con Mercado Pago"
                                  }
                                  img={<SiMercadopago size={20} />}
                                  textSmall={true}
                                  onClick={mercadoPagoMutation.mutate}
                                  disabled={mercadoPagoMutation.isPending}
                                />
                              )}
                              <BlackButton
                                text="Ver datos para transferir"
                                textSmall={true}
                                onClick={() => setOpenModal(true)}
                              />
                            </div>

                            {!myTenantStatus?.mercadoPagoConnected && (
                              <p className="text-gray-500 mt-4">
                                El negocio no tiene habilitados pagos mediante
                                Mercado Pago.
                              </p>
                            )}
                          </div>
                        )}
                      </div>
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

                    <div className="mt-8">
                      <h2 className="text-2xl font-semibold">
                        Mis pagos en {tenantName}
                      </h2>

                      <p className="text-gray-500 mt-1">
                        {myTenantPayments.length}{" "}
                        {myTenantPayments.length === 1 ? "pago" : "pagos"} en{" "}
                        {MONTHS[selectedMonth - 1].toLowerCase()} de{" "}
                        {selectedYear}.
                      </p>
                    </div>

                    <div className="grid gap-6 mt-8 sm:grid-cols-2 xl:grid-cols-3">
                      {myTenantPayments.length > 0 ? (
                        myTenantPayments.map((p) => (
                          <PaymentCard
                            key={p.id}
                            payment={p}
                            showUser={false}
                            tenantId={tenantId}
                          />
                        ))
                      ) : (
                        <div className="sm:col-span-2 xl:col-span-3 text-center py-12 text-gray-500">
                          No realizaste pagos en{" "}
                          {MONTHS[selectedMonth - 1].toLowerCase()} de{" "}
                          {selectedYear}.
                        </div>
                      )}
                    </div>
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>

      {openCreateModal && (
        <PaymentForm
          tenantId={tenantId}
          close={() => setOpenCreateModal(false)}
        />
      )}

      {openModal && (
        <PaymentDataModal
          tenantId={tenantId}
          close={() => setOpenModal(false)}
        />
      )}
    </MainLayout>
  );
}
