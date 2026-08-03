import { useLocation } from "wouter";
import MainLayout from "../layouts/main-layout";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <MainLayout>
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="text-center px-4 mt-10 min-[900px]:mt-0">
          <div className="mb-8">
            <h1 className="text-9xl md:text-[150px] font-bold text-[#333] leading-none">
              404
            </h1>
            <div className="h-1 w-30 bg-[#333] mx-auto mt-4"></div>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold text-[#333] mb-4">
            Página no encontrada
          </h2>

          <p className="text-gray-600 text-lg md:text-xl mb-2">
            Parece que esta página no existe o no tienes acceso.
          </p>

          <p className="text-gray-500 text-base md:text-lg mb-8">
            Volvé al inicio o verifica el enlace que intentas abrir.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setLocation("/")}
              className="bg-[#333] text-white px-8 py-3 rounded-xl hover:bg-gray-700 transition font-semibold cursor-pointer"
            >
              Ir a Inicio
            </button>

            <button
              onClick={() => window.history.back()}
              className="border-2 border-[#333] text-[#333] px-8 py-3 rounded-xl hover:bg-[#efefef] transition font-semibold cursor-pointer"
            >
              Volver atrás
            </button>
          </div>

          <div className="mt-16 pt-8 border-t border-gray-300">
            <p className="text-gray-500 text-sm">
              ¿Necesitás ayuda? Contactá con soporte:
              contacto@turnofacilapp.com.ar
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
