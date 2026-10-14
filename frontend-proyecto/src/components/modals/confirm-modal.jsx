import { AlertTriangle, X } from "lucide-react";
import Modal from "./modal";
import WhiteButton from "../buttons/white-button";
import RedButton from "../buttons/red-button";

export default function ConfirmModal({
  title = "¿Eliminar este elemento?",
  message = "Esta acción no se puede deshacer.",
  confirmText = "Eliminar",
  cancelText = "Cancelar",
  onConfirm,
  close,
  isPending = false,
}) {
  return (
    <Modal open onClose={close} isSuccesOrError={true}>
      <button
        type="button"
        onClick={close}
        disabled={isPending}
        aria-label="Cerrar"
        className="absolute top-4 right-4 z-10 cursor-pointer text-white transition hover:text-gray-200 disabled:opacity-50"
      >
        <X size={20} />
      </button>

      <div className="bg-[#ec5e66] flex justify-center py-10">
        <AlertTriangle className="text-white" size={80} />
      </div>

      <div className="flex flex-col items-center justify-center text-center px-8 gap-2 my-5">
        <h4 className="font-semibold text-2xl">{title}</h4>

        <p className="text-xl text-gray-600 whitespace-pre-line">{message}</p>

        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <WhiteButton
            onClick={close}
            disabled={isPending}
            text={cancelText}
            textSmall
          />

          <RedButton
            onClick={onConfirm}
            disabled={isPending}
            text={isPending ? "Eliminando..." : confirmText}
            textSmall
          />
        </div>
      </div>
    </Modal>
  );
}
