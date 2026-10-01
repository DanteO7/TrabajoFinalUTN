import Modal from "./modal";
import { BadgeCheck, X } from "lucide-react";

export default function ApprovalModal({ close, message, isSuccesOrError }) {
  return (
    <Modal open={true} onClose={close} isSuccesOrError={isSuccesOrError}>
      <button
        onClick={close}
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition duration-200 cursor-pointer"
        aria-label="Cerrar"
      >
        <X size={20} />
      </button>

      <div className="bg-[#5f7de9] flex justify-center py-10">
        <BadgeCheck className="text-white" size={80} />
      </div>

      <div className="flex flex-col items-center justify-center text-center px-6 sm:px-10 gap-3 my-6">
        <h4 className="font-semibold text-2xl">¡Solicitud enviada!</h4>

        <p className="text-base sm:text-lg text-gray-700">
          {message ||
            "Ya recibimos tu formulario. Te avisaremos por email cuando tu negocio esté creado o si detectamos algún problema con el pago."}
        </p>

        <button
          onClick={close}
          className="mt-3 rounded-4xl px-7 py-3 bg-[#5f7de9] text-white hover:bg-[#5273e8] transition-all duration-200 cursor-pointer"
        >
          Entendido
        </button>
      </div>
    </Modal>
  );
}
