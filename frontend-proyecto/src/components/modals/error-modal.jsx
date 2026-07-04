import { CircleX } from "lucide-react";
import Modal from "./modal";

export default function ErrorModal({ close, message, isSuccesOrError }) {
  return (
    <Modal open={true} onClose={close} isSuccesOrError={isSuccesOrError}>
      <div className="bg-[#ec5e66] flex justify-center py-10">
        <CircleX className="text-white" size={80} />
      </div>
      <div className="flex flex-col items-center justify-center text-center px-8 gap-2 my-5">
        <h4 className="font-semibold text-2xl">Error!</h4>
        <p className="text-xl">{message}</p>
        <button
          onClick={close}
          className="text-xl bg-[#ec5e66] text-white rounded-4xl px-7 py-3 mt-5 cursor-pointer hover:bg-[#cc4148] transition-all duration-200"
        >
          Cerrar
        </button>
      </div>
    </Modal>
  );
}
