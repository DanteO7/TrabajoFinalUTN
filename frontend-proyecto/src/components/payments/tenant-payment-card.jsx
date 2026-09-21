import { SiMercadopago } from "react-icons/si";

import BlackButton from "../buttons/black-button";

const roleConfig = {
  Owner: {
    text: "Dueño",
    className: "bg-purple-300 text-purple-600",
  },
  Professor: {
    text: "Profesor",
    className: "bg-blue-300 text-blue-600",
  },
  Student: {
    text: "Alumno",
    className: "bg-orange-200 text-yellow-600",
  },
};

export default function TenantPaymentCard({
  tenant,
  turnoFacilPaymentData,
  mercadoPagoMutation,
  openTransferModal,
}) {
  const status = tenant.monthlyFeeStatus?.toLowerCase();

  const isPaid = status === "paid";
  const isOverdue = status === "overdue";

  const role = roleConfig[tenant.role];

  const formatDate = (date) => {
    if (!date) {
      return "Sin fecha";
    }

    return new Date(date).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="rounded-xl border p-6 shadow-md">
      <div className="flex flex-col gap-5">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-semibold">{tenant.name}</h3>

            <p className="text-gray-500 mt-1">
              {isPaid
                ? "Cuota al día"
                : isOverdue
                  ? "Cuota vencida"
                  : "Cuota pendiente"}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            {tenant.isActive ? (
              <span className="flex items-center justify-center rounded-full px-2.25 py-px text-[13px] bg-[#a1f3be] text-green-600">
                Activo
              </span>
            ) : (
              <span className="flex items-center justify-center rounded-full px-2.25 py-px text-[13px] bg-red-300 text-red-600">
                Inactivo
              </span>
            )}
            {role && (
              <span
                className={`flex items-center justify-center rounded-full px-2.25 py-px text-[13px] h-fit ${role.className}`}
              >
                {role.text}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between">
            <span className="text-gray-500">Estado</span>

            <span
              className={
                isPaid
                  ? "text-green-600 font-semibold"
                  : isOverdue
                    ? "text-red-600 font-semibold"
                    : "text-yellow-600 font-semibold"
              }
            >
              {isPaid ? "Pagado" : isOverdue ? "Vencido" : "Pendiente"}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">Vencimiento</span>

            <span className="font-medium">
              {formatDate(tenant.paymentDueDate)}
            </span>
          </div>
        </div>

        {!isPaid && (
          <div className="flex flex-col gap-3">
            {tenant.mercadoPagoConnected && (
              <BlackButton
                text={
                  mercadoPagoMutation.isPending
                    ? "Generando pago..."
                    : "Pagar con Mercado Pago"
                }
                img={<SiMercadopago size={20} />}
                textSmall={true}
                wfit={true}
                disabled={mercadoPagoMutation.isPending}
                onClick={() => mercadoPagoMutation.mutate(tenant.id)}
              />
            )}

            {(turnoFacilPaymentData?.alias || turnoFacilPaymentData?.cbu) && (
              <BlackButton
                text="Ver datos para transferir"
                textSmall={true}
                wfit={true}
                onClick={() => openTransferModal(tenant)}
              />
            )}

            {!tenant.mercadoPagoConnected &&
              !turnoFacilPaymentData?.alias &&
              !turnoFacilPaymentData?.cbu && (
                <p className="text-gray-500 text-sm">
                  TurnoFácil no tiene datos de transferencia configurados.
                </p>
              )}
          </div>
        )}
      </div>
    </div>
  );
}
