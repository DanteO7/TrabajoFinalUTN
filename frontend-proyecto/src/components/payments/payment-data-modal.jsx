import { useState } from "react";
import { X, Copy, Check } from "lucide-react";
import Modal from "../modals/modal";
import BlackButton from "../buttons/black-button";

export default function PaymentDataModal({ close, name, price, paymentData }) {
  const [copied, setCopied] = useState(false);

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

      <h2 className="text-2xl font-semibold mb-2">Datos para transferir</h2>

      <p className="text-gray-600 mb-6">{name}</p>

      <div className="space-y-4 mb-8">
        <div className="bg-[#efefef] rounded-xl p-4">
          <p className="text-sm text-gray-600 mb-1">Importe a transferir</p>

          <p className="text-2xl font-bold text-[#333]">
            ${price?.toLocaleString("es-AR")}
          </p>
        </div>

        {paymentData?.alias && (
          <div className="bg-[#efefef] rounded-xl p-4">
            <p className="text-sm text-gray-600 mb-2">Alias</p>

            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold text-[#333] break-all">
                {paymentData.alias}
              </p>

              <BlackButton
                type="button"
                text={copied ? "Copiado" : "Copiar"}
                textSmall={true}
                wfit
                img={copied ? <Check size={16} /> : <Copy size={16} />}
                onClick={() => copyPaymentData(paymentData.alias)}
                className="flex items-center gap-2 shrink-0 px-3 py-2 rounded-lg text-sm text-gray-600 hover:text-black hover:bg-white transition cursor-pointer"
              />
            </div>
          </div>
        )}

        {!paymentData?.alias && paymentData?.cbu && (
          <div className="bg-[#efefef] rounded-xl p-4">
            <p className="text-sm text-gray-600 mb-2">CBU</p>

            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold text-[#333] break-all">
                {paymentData.cbu}
              </p>

              <BlackButton
                type="button"
                text={copied ? "Copiado" : "Copiar"}
                textSmall={true}
                wfit
                img={copied ? <Check size={16} /> : <Copy size={16} />}
                onClick={() => copyPaymentData(paymentData.cbu)}
                className="flex items-center gap-2 shrink-0 px-3 py-2 rounded-lg text-sm text-gray-600 hover:text-black hover:bg-white transition cursor-pointer"
              />
            </div>
          </div>
        )}

        {!paymentData?.alias && !paymentData?.cbu && (
          <div className="bg-red-50 rounded-xl p-4">
            <p className="text-sm text-red-600">
              No hay datos de transferencia configurados.
            </p>
          </div>
        )}
      </div>

      <p className="text-sm text-gray-500 text-center">
        Realizá la transferencia por el importe indicado y luego enviá el
        comprobante.
      </p>
    </Modal>
  );
}
