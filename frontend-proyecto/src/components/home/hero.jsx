import { useAuthStore } from "../../store/auth-store";

export default function Hero({ onOpenModal, openForbiddenModal }) {
  const { isAuthenticated } = useAuthStore();

  return (
    <section className="bg-red-300 w-dvw h-[calc(100vh-52px)]">
      <div className="flex flex-col justify-center h-full p-8 gap-5 md:p-[10%] lg:pr-120 ">
        <h1 className="text-5xl md:text-7xl lg:text-8xl">TurnoFacil</h1>
        <span className="md:text-2xl">
          La forma más simple de organizar tu negocio. Automatizá turnos,
          controlá cupos y gestioná alumnos y profesores desde cualquier
          dispositivo.
        </span>
        <button
          onClick={isAuthenticated ? onOpenModal : openForbiddenModal}
          className="w-fit text-[#efefef] bg-[#333] rounded-[14px] px-5 py-2 cursor-pointer border-[1.7px] border-[#333] hover:bg-gray-300 hover:text-[#333] hover:border-gray-400 transition duration-300 lg:text-xl"
        >
          Contratar ahora
        </button>
      </div>
    </section>
  );
}
