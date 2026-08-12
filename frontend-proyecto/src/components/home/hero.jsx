import { useAuthStore } from "../../store/auth-store";
import BlackButton from "../buttons/black-button";

export default function Hero({ onOpenModal, openForbiddenModal }) {
  const { isAuthenticated } = useAuthStore();

  return (
    <section className="bg-gray-500 w-dvw h-[calc(100vh-52px)]">
      <div className="flex flex-col justify-center h-full p-8 gap-5 md:p-[10%] lg:pr-120 ">
        <img src="/logo.png" alt="logo de turno facil" className="w-150" />

        <span className="md:text-2xl">
          La forma más simple de organizar tu negocio. Automatizá turnos,
          controlá cupos y gestioná alumnos y profesores desde cualquier
          dispositivo.
        </span>
        <BlackButton
          onClick={isAuthenticated ? onOpenModal : openForbiddenModal}
          text={"Contratar ahora"}
          wfit={true}
        />
      </div>
    </section>
  );
}
