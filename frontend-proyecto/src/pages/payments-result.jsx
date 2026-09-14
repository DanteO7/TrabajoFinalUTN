import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "../layouts/main-layout";
import Loading from "../components/loading";
import RedButton from "../components/buttons/red-button";
import ColorButton from "../components/buttons/color-button";
import { getPayment } from "../services/payment";

export default function PaymentsResult() {
  const [, navigate] = useLocation();

  const params = new URLSearchParams(window.location.search);

  const paymentId = params.get("external_reference");

  const {
    data: payment,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["payment", paymentId],
    queryFn: () => getPayment(paymentId),
    enabled: !!paymentId,
  });

  if (isLoading) {
    return (
      <MainLayout>
        <div className="w-full max-w-100 mt-12">
          <Loading />
        </div>
      </MainLayout>
    );
  }

  if (!paymentId || isError || !payment) {
    return (
      <MainLayout>
        <div className="border mt-12 p-4 rounded-xl flex flex-col gap-2 shadow-md max-w-100 min-[900px]:p-5 min-[900px]:gap-5">
          <h1 className="font-semibold text-[19px] text-[#fc697b] min-[900px]:text-2xl">
            No se pudo consultar el pago
          </h1>

          <p>No pudimos encontrar la información de este pago.</p>

          <RedButton
            text="Volver a pagos"
            textSmall
            onClick={() => navigate("/")}
          />
        </div>
      </MainLayout>
    );
  }

  const goToPayments = () => {
    navigate(`/tu-espacio/${payment.tenantId}/pagos`);
  };

  if (payment.status === "Paid") {
    return (
      <MainLayout>
        <div className="border mt-12 p-4 rounded-xl flex flex-col gap-2 shadow-md max-w-100 min-[900px]:p-5 min-[900px]:gap-5">
          <h1 className="font-semibold text-[19px] text-[#1fc762] min-[900px]:text-2xl">
            ¡Pago realizado correctamente!
          </h1>

          <p>Tu pago fue aprobado correctamente.</p>

          <ColorButton
            text="Volver a pagos"
            textSmall
            onClick={goToPayments}
            bgColor="#1fc762"
            textColor="#efefef"
            hoverColor="#18b356"
            disabledColor="#6dda98"
          />
        </div>
      </MainLayout>
    );
  }

  if (payment.status === "Pending") {
    return (
      <MainLayout>
        <div className="border mt-12 p-4 rounded-xl flex flex-col gap-2 shadow-md max-w-100 min-[900px]:p-5 min-[900px]:gap-5">
          <h1 className="font-semibold text-[19px] text-[#e5a400] min-[900px]:text-2xl">
            Pago pendiente
          </h1>

          <p>
            El pago todavía no fue confirmado. Esto puede demorar unos
            instantes.
          </p>

          <ColorButton
            text="Volver a pagos"
            textSmall
            onClick={goToPayments}
            bgColor="#e5a400"
            textColor="#efefef"
            hoverColor="#c99000"
            disabledColor="#e5c766"
          />
        </div>
      </MainLayout>
    );
  }

  if (payment.status === "Rejected") {
    return (
      <MainLayout>
        <div className="border mt-12 p-4 rounded-xl flex flex-col gap-2 shadow-md max-w-100 min-[900px]:p-5 min-[900px]:gap-5">
          <h1 className="font-semibold text-[19px] text-[#fc697b] min-[900px]:text-2xl">
            Pago rechazado
          </h1>

          <p>Mercado Pago rechazó el pago. Podés intentar nuevamente.</p>

          <RedButton text="Volver a pagos" textSmall onClick={goToPayments} />
        </div>
      </MainLayout>
    );
  }

  if (payment.status === "Cancelled") {
    return (
      <MainLayout>
        <div className="border mt-12 p-4 rounded-xl flex flex-col gap-2 shadow-md max-w-100 min-[900px]:p-5 min-[900px]:gap-5">
          <h1 className="font-semibold text-[19px] text-[#fc697b] min-[900px]:text-2xl">
            Pago cancelado
          </h1>

          <p>El pago fue cancelado.</p>

          <RedButton text="Volver a pagos" textSmall onClick={goToPayments} />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="border mt-12 p-4 rounded-xl flex flex-col gap-2 shadow-md max-w-100 min-[900px]:p-5 min-[900px]:gap-5">
        <h1 className="font-semibold text-[19px] min-[900px]:text-2xl">
          Estado del pago
        </h1>

        <p>Estado actual: {payment.status}</p>

        <ColorButton
          text="Volver a pagos"
          textSmall
          onClick={goToPayments}
          bgColor="#333"
          textColor="#efefef"
          hoverColor="#222"
          disabledColor="#777"
        />
      </div>
    </MainLayout>
  );
}
