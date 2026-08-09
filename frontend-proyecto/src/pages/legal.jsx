import MainLayout from "../layouts/main-layout";
import { IoArrowBack } from "react-icons/io5";

export default function Legal() {
  const handleBack = () => {
    window.history.back();
  };

  return (
    <MainLayout>
      <div className="lg:w-[60%] m-auto mt-12">
        <button
          onClick={handleBack}
          className="text-gray-500 hover:text-black transition flex items-center gap-2 mb-6 cursor-pointer "
        >
          <IoArrowBack />
          Volver
        </button>

        <h2 className="text-4xl font-semibold">Aviso Legal</h2>
        <span className="text-gray-600 text-[13px] my-20">
          Última actualización: 8 de julio de 2026
        </span>
        <div className="my-7">
          <h3 className="font-semibold text-xl">Titular del sitio</h3>
          <p>
            Turno Fácil es una plataforma destinada a la gestión y
            administración de turnos para distintos tipos de negocios.
          </p>
        </div>
        <div className="my-7">
          <h3 className="font-semibold text-xl">Propiedad intelectual</h3>
          <p>
            Todo el contenido presente en este sitio, incluyendo textos,
            logotipos, diseños, imágenes, código fuente y demás elementos,
            pertenece a Turno Fácil o se utiliza con la correspondiente
            autorización. Queda prohibida su reproducción total o parcial sin
            autorización.
          </p>
        </div>
        <div className="my-7">
          <h3 className="font-semibold text-xl">Uso del sitio</h3>
          <p>
            El acceso y utilización del sitio implica la aceptación de este
            Aviso Legal y del resto de los documentos legales publicados.
          </p>
        </div>
        <div className="my-7">
          <h3 className="font-semibold text-xl">Enlaces externos</h3>
          <p>
            El sitio puede contener enlaces hacia servicios de terceros. Turno
            Fácil no es responsable por el contenido ni por las políticas de
            privacidad de dichos servicios.
          </p>
        </div>
        <div className="my-7">
          <h3 className="font-semibold text-xl">
            Limitación de responsabilidad
          </h3>
          <p>
            Aunque trabajamos para ofrecer un servicio estable y seguro, no
            garantizamos la disponibilidad ininterrumpida de la plataforma ni
            nos responsabilizamos por daños derivados de interrupciones, fallos
            técnicos o situaciones ajenas a nuestro control.
          </p>
        </div>
        <div className="mt-7">
          <h3 className="font-semibold text-xl">Legislación aplicable</h3>
          <p>
            Este sitio se regirá por la legislación vigente de la República
            Argentina. Cualquier controversia será resuelta conforme a dicha
            legislación.
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
