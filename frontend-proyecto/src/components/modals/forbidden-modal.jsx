import React from "react";
import Modal from "./modal";
import { RiErrorWarningLine } from "react-icons/ri";
import { Link } from "wouter";

export default function ForbiddenModal({ close, isSuccesOrError }) {
  return (
    <Modal open={true} onClose={close} isSuccesOrError={isSuccesOrError}>
      <div className="bg-[#a3a3a3] flex justify-center py-10">
        <RiErrorWarningLine className="text-white" size={80} />
      </div>
      <div className="flex flex-col items-center justify-center text-center px-8 gap-2 my-5">
        <h4 className="font-semibold text-2xl">Atención</h4>
        <p className="text-xl">
          Necesitas iniciar sesión para realizar esta acción
        </p>
        <Link
          href="/iniciar-sesion"
          className="text-xl bg-[#a3a3a3] text-white rounded-4xl px-7 py-3 mt-5 cursor-pointer hover:bg-[#949494] transition-all duration-200"
        >
          Iniciar sesión
        </Link>
      </div>
    </Modal>
  );
}
