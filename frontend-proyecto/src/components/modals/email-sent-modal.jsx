import React from "react";
import Modal from "./modal";
import { MdOutlineEmail } from "react-icons/md";
import { X } from "lucide-react";
import { useState } from "react";

export default function EmailSentModal({
  close,
  email,
  isSuccesOrError,
  sendAgain,
  seconds,
}) {
  return (
    <Modal open={true} onClose={close} isSuccesOrError={isSuccesOrError}>
      <button
        onClick={close}
        className="absolute top-4 right-4 text-white hover:text-gray-300 transition duration-200 cursor-pointer"
      >
        <X size={20} />
      </button>
      <div className="bg-[#5f7de9] flex justify-center py-10">
        <MdOutlineEmail className="text-white" size={80} />
      </div>
      <div className="flex flex-col items-center justify-center text-center px-10 gap-2 my-5">
        <h4 className="font-semibold text-2xl mb-1">Email enviado!</h4>
        <p className="text-xl">
          Se ha enviado un mail a: <b>{email}</b>. Revisa la bandeja de entrada
          o spam
        </p>
        <div className="flex flex-col my-4 gap-2">
          <span>¿No te llegó?</span>
          <button
            onClick={sendAgain}
            disabled={seconds > 0}
            className={`text-xl rounded-4xl px-7 py-3 transition-all duration-200 ${
              seconds > 0
                ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                : "bg-[#5f7de9] text-white hover:bg-[#5273e8] cursor-pointer"
            }`}
          >
            {seconds > 0 ? `Reenviar en ${seconds}s` : "Enviar de vuelta"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
