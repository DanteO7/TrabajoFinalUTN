import { IoArrowBack } from "react-icons/io5";
import MainLayout from "../layouts/main-layout";

export default function PrivacyPolicy() {
  const handleBack = () => {
    window.history.back();
  };

  return (
    <div>
      <MainLayout>
        <div className="lg:w-[60%] mt-12">
          <button
            onClick={handleBack}
            className="text-gray-500 hover:text-black transition flex items-center gap-2 mb-6 cursor-pointer "
          >
            <IoArrowBack color="fc697b" />
            Volver
          </button>
          <h2 className="text-4xl font-semibold">Política de Privacidad</h2>
          <span className="text-gray-600 text-[13px] my-20">
            Última actualización: 8 de julio de 2026
          </span>
          <h3 className="font-semibold text-xl mt-4">
            En Turno Fácil nos comprometemos a proteger la privacidad de
            nuestros usuarios y a tratar su información de manera responsable.
          </h3>
          <div className="my-7">
            <h3 className="font-semibold text-xl">
              1. Información que recopilamos
            </h3>
            <p>
              Al utilizar Turno Fácil podemos recopilar la siguiente
              información:
            </p>
            <ul className="list-disc ml-7">
              <li>Nombre y apellido.</li>
              <li>Dirección de correo electrónico.</li>
              <li>
                Contraseña (almacenada de forma cifrada y nunca en texto plano).
              </li>
              <li>
                Información relacionada con los negocios administrados mediante
                la plataforma.
              </li>
              <li>
                Datos de profesores, alumnos y turnos creados por el usuario.
              </li>
            </ul>
          </div>
          <div className="my-7">
            <h3 className="font-semibold text-xl">2. Uso de la información</h3>
            <p>La información recopilada es utilizada únicamente para: </p>
            <ul className="list-disc ml-7">
              <li>Crear y administrar cuentas de usuario.</li>
              <li>Permitir el acceso a la plataforma.</li>
              <li>Gestionar negocios, profesores, alumnos y turnos.</li>
              <li>
                Enviar correos electrónicos de verificación y recuperación de
                contraseña.
              </li>
              <li>Mejorar el funcionamiento y la seguridad del servicio.</li>
            </ul>
          </div>
          <div className="my-7">
            <h3 className="font-semibold text-xl">3. Compartición de datos</h3>
            <p>
              Turno Fácil no vende ni comercializa información personal. Algunos
              servicios externos pueden procesar determinados datos para brindar
              funcionalidades específicas, como el envío de correos
              electrónicos.
            </p>
          </div>
          <div className="my-7">
            <h3 className="font-semibold text-xl">4. Seguridad </h3>
            <p>
              Implementamos medidas de seguridad para proteger la información
              almacenada. Las contraseñas se encuentran cifradas y no pueden ser
              recuperadas por el personal de Turno Fácil.
            </p>
          </div>
          <div className="my-7">
            <h3 className="font-semibold text-xl">5. Conservación de datos</h3>
            <p>
              Los datos permanecerán almacenados mientras la cuenta continúe
              activa o hasta que el usuario solicite su eliminación, salvo
              obligación legal de conservar determinada información.
            </p>
          </div>
          <div className="my-7">
            <h3 className="font-semibold text-xl">6. Derechos del usuario</h3>
            <p>Los usuarios pueden solicitar:</p>
            <ul className="list-disc ml-7">
              <li>Acceder a sus datos.</li>
              <li>Corregir información incorrecta.</li>
              <li>
                Solicitar la eliminación de su cuenta y sus datos cuando
                corresponda.
              </li>
            </ul>
          </div>
          <div className="my-7">
            <h3 className="font-semibold text-xl">7. Cookies</h3>
            <p>
              Turno Fácil puede utilizar cookies necesarias para mantener la
              sesión iniciada y mejorar la experiencia de uso.
            </p>
          </div>
          <div className="my-7">
            <h3 className="font-semibold text-xl">
              8. Cambios en esta política
            </h3>
            <p>
              Esta Política de Privacidad podrá actualizarse para reflejar
              mejoras o cambios en el servicio.
            </p>
          </div>
          <div className="mt-7">
            <h3 className="font-semibold text-xl">9. Contacto</h3>
            <p>
              Si tenés consultas relacionadas con esta política, podés
              comunicarte con el equipo de Turno Fácil mediante los canales de
              contacto disponibles.
            </p>
          </div>
        </div>
      </MainLayout>
    </div>
  );
}
