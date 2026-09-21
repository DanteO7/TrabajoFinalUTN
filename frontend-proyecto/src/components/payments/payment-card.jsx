import { useState } from "react";
import PaymentModal from "./payment-modal";

export default function PaymentCard({ payment, showUser, tenantId, isAdmin }) {
  const [openModal, setOpenModal] = useState(false);

  const getStatusText = (status) => {
    switch (status) {
      case "Paid":
        return "Pagado";

      case "Pending":
        return "Pendiente";

      case "Rejected":
        return "Rechazado";

      case "Cancelled":
        return "Cancelado";

      default:
        return status;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-700";

      case "Pending":
        return "bg-yellow-100 text-yellow-700";

      case "Rejected":
      case "Cancelled":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getPaymentMethodText = (method) => {
    switch (method) {
      case "Cash":
        return "Efectivo";

      case "Bank Transfer":
        return "Transferencia";

      case "Debit Card":
        return "Tarjeta de débito";

      case "Mercado Pago":
        return "Mercado Pago";

      default:
        return method;
    }
  };
  return (
    <div
      onClick={() => setOpenModal(true)}
      className="cursor-pointer rounded-xl border p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      <div className="flex justify-between items-start gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold truncate">
            {showUser
              ? `${payment.user?.name} ${payment.user?.surname}`
              : `${payment.tenantName} `}
          </h3>
          <span className="text-gray-500 text-sm">
            {!showUser && `${payment.user?.name} ${payment.user?.surname}`}
          </span>
        </div>

        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
            payment.status,
          )}`}
        >
          {getStatusText(payment.status)}
        </span>
      </div>

      <div className="mt-5 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-semibold">
            ${Number(payment.amount).toLocaleString("es-AR", {})}
          </span>
          <span className="text-gray-600">
            {getPaymentMethodText(payment.paymentMethod)}
          </span>
          <span className="text-gray-600">
            {new Date(payment.paymentDate).toLocaleDateString("es-AR")}
          </span>
        </div>
      </div>
      {openModal && (
        <PaymentModal
          tenantId={tenantId}
          payment={payment}
          close={() => setOpenModal(false)}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
}
