import { useAuthStore } from "../../store/auth-store";
import BlackButton from "../buttons/black-button";

export default function Hero({ onOpenModal, openForbiddenModal }) {
  const { isAuthenticated } = useAuthStore();

  return (
    <section className="bg-[linear-gradient(rgba(0,0,0,0.5),rgba(0,0,0,0.5)),url('/fondo.webp')] bg-cover bg-position-[83%_center] min:[900px]:bg-center bg-no-repeat w-dvw h-[calc(100vh-52px)]">
      <div className="flex flex-col justify-center h-full p-8 gap-5 md:p-[10%] md:pr-[40%] lg:pr-[50%] ">
        <img src="/logo.webp" alt="logo de turno facil" className="w-150" />

        <span className="md:text-2xl text-[#efefef]">
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
