import { CircleCheckBig } from "lucide-react";
import Modal from "./modal";

export default function SuccessModal({ close, message, isSuccesOrError }) {
  return (
    <Modal open={true} onClose={close} isSuccesOrError={isSuccesOrError}>
      <div className="bg-[#48bb72] flex justify-center py-10">
        <CircleCheckBig className="text-white" size={80} />
      </div>
      <div className="flex flex-col items-center justify-center text-center px-8 gap-2 my-5">
        <h4 className="font-semibold text-2xl">Exito!</h4>
        <p className="text-xl">{message}</p>
      </div>
    </Modal>
  );
}
