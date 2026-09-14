import { useState } from "react";

import { X, Copy, Check } from "lucide-react";

import Modal from "../modals/modal";

import { getTenantById } from "../../services/tenant";

import { useQuery } from "@tanstack/react-query";
import BlackButton from "../buttons/black-button";

export default function PaymentDataModal({ close, tenantId }) {
  const [copied, setCopied] = useState(false);

  const {
    data: tenant,
    isLoading,
    isError,
    error: backendError,
  } = useQuery({
    queryKey: ["tenantById", tenantId],
    queryFn: () => getTenantById(tenantId),
  });

  const copyPaymentData = async (value) => {
    try {
      await navigator.clipboard.writeText(value);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("No se pudo copiar:", error);
    }
  };

  return (
    <Modal open={true} onClose={close}>
      <button
        onClick={close}
        className="absolute top-4 right-4 text-gray-500 hover:text-black transition duration-200 cursor-pointer"
      >
        <X size={20} />
      </button>

      {isLoading && (
        <div className="py-8 text-center text-gray-500">
          Cargando datos de pago...
        </div>
      )}

      {isError && (
        <div className="py-8 text-center text-red-500">
          {backendError?.response?.data?.message ||
            "No se pudieron cargar los datos de pago."}
        </div>
      )}

      {tenant && !isLoading && !isError && (
        <>
          <h2 className="text-2xl font-semibold mb-2">Datos para transferir</h2>

          <p className="text-gray-600 mb-6">{tenant.name}</p>

          <div className="space-y-4 mb-8">
            {/* IMPORTE */}
            <div className="bg-[#efefef] rounded-xl p-4">
              <p className="text-sm text-gray-600 mb-1">Importe a transferir</p>

              <p className="text-2xl font-bold text-[#333]">
                ${tenant.tenantPlan?.price?.toLocaleString("es-AR")}
              </p>
            </div>

            {/* ALIAS */}
            {tenant.alias && (
              <div className="bg-[#efefef] rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-2">Alias</p>

                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-[#333] break-all">
                    {tenant.alias}
                  </p>

                  <BlackButton
                    type="button"
                    text={copied ? "Copiado" : "Copiar"}
                    textSmall={true}
                    wfit
                    img={copied ? <Check size={16} /> : <Copy size={16} />}
                    onClick={() => copyPaymentData(tenant.alias)}
                    className="flex items-center gap-2 shrink-0 px-3 py-2 rounded-lg text-sm text-gray-600 hover:text-black hover:bg-white transition cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* CBU */}
            {!tenant.alias && tenant.cbu && (
              <div className="bg-[#efefef] rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-2">CBU</p>

                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-[#333] break-all">
                    {tenant.cbu}
                  </p>

                  <BlackButton
                    type="button"
                    text={copied ? "Copiado" : "Copiar"}
                    textSmall={true}
                    wfit
                    img={copied ? <Check size={16} /> : <Copy size={16} />}
                    onClick={() => copyPaymentData(tenant.alias)}
                    className="flex items-center gap-2 shrink-0 px-3 py-2 rounded-lg text-sm text-gray-600 hover:text-black hover:bg-white transition cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* SIN DATOS */}
            {!tenant.alias && !tenant.cbu && (
              <div className="bg-red-50 rounded-xl p-4">
                <p className="text-sm text-red-600">
                  Este comercio todavía no configuró sus datos para recibir
                  transferencias.
                </p>
              </div>
            )}
          </div>

          <p className="text-sm text-gray-500 text-center">
            Realizá la transferencia por el importe indicado y luego enviá el
            comprobante al comercio.
          </p>
        </>
      )}
    </Modal>
  );
}
