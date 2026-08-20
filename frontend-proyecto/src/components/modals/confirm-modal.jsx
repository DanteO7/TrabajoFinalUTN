import { AlertTriangle, X } from "lucide-react";
import Modal from "./modal";

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
    <Modal open onClose={close}>
      <div className="relative">
        <button
          onClick={close}
          disabled={isPending}
          className="absolute top-0 right-0 text-gray-400 hover:text-black transition cursor-pointer disabled:opacity-50"
        >
          <X size={20} />
        </button>

        <div className="flex items-start gap-4 pr-8">
          <div className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-full bg-red-100 text-red-600">
            <AlertTriangle size={22} />
          </div>

          <div className="flex-1">
            <h2 className="text-xl font-semibold text-[#333]">{title}</h2>

            <p className="text-gray-500 mt-2">{message}</p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={close}
            disabled={isPending}
            className="flex-1 rounded-xl border border-gray-300 py-2.5 text-[#333] hover:bg-gray-100 transition cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 rounded-xl bg-[#fc697b] py-2.5 text-white hover:bg-red-600 transition cursor-pointer disabled:opacity-50"
          >
            {isPending ? "Eliminando..." : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
