export default function Hero() {
  return (
    <section className="bg-red-300 w-full h-137.5">
      <div className="flex flex-col justify-center h-full p-8 gap-5 md:p-40 lg:pr-100">
        <h1 className="text-5xl md:text-7xl">TurnoFacil</h1>
        <span>
          La forma más simple de organizar tu negocio. Automatizá turnos,
          controlá cupos y gestioná alumnos y profesores desde cualquier
          dispositivo.
        </span>
        <button className="w-fit text-[#efefef] bg-[#333] rounded-[14px] px-5 py-2 cursor-pointer border-[1.7px] border-[#333] hover:bg-gray-300 hover:text-[#333] hover:border-gray-400 transition duration-300">
          Contratar ahora
        </button>
      </div>
    </section>
  );
}
