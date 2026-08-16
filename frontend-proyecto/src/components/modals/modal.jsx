import { useEffect, forwardRef } from "react";
import { createPortal } from "react-dom";

// Contador global de modales abiertos
let openModalsCount = 0;

const Modal = forwardRef(function Modal(
  { open, onClose, children, isSuccesOrError },
  ref,
) {
  useEffect(() => {
    if (!open) return;

    // Incrementar contador cuando se abre
    openModalsCount++;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      // Decrementar cuando se cierra
      openModalsCount--;
      document.removeEventListener("keydown", handleKeyDown);

      // Solo habilitar scroll si no hay más modales abiertos
      if (openModalsCount === 0) {
        document.body.style.overflow = "";
      }
    };
  }, [open, onClose]);

  const handleOverlayMouseDown = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-9999 bg-black/40 backdrop-blur-xs flex items-center justify-center px-4"
      onMouseUp={handleOverlayMouseDown}
    >
      <div
        ref={ref}
        className={`bg-white rounded-xl ${isSuccesOrError ? "p-0" : "p-6"} w-120 shadow-xl
          max-h-[90vh] overflow-y-auto
          transition-all duration-300 ease-out
          translate-y-0 opacity-100
          animate-modal`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
});

export default Modal;
