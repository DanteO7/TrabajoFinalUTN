import React from "react";
import MainLayout from "../layouts/main-layout";

export default function Terms() {
  return (
    <MainLayout>
      <div className="lg:w-[60%] mt-10">
        <h2 className="text-4xl font-semibold">Términos y Condiciones</h2>
        <span className="text-gray-600 text-[13px] my-20">
          Última actualización: 8 de julio de 2026
        </span>
        <h3 className="font-semibold text-xl mt-4">
          Al utilizar Turno Fácil aceptás los siguientes términos y condiciones.
        </h3>
        <div className="my-7">
          <h3 className="font-semibold text-xl">1. Objeto del servicio</h3>
          <p>
            Turno Fácil es una plataforma destinada a la gestión de turnos,
            alumnos, profesores y negocios.
          </p>
        </div>
        <div className="my-7">
          <h3 className="font-semibold text-xl">2. Registro</h3>
          <p>
            Para utilizar determinadas funciones es necesario crear una cuenta
            proporcionando información veraz y actualizada. Cada usuario es
            responsable de mantener la confidencialidad de sus credenciales.
          </p>
        </div>
        <div className="my-7">
          <h3 className="font-semibold text-xl">3. Uso permitido</h3>
          <p>
            El usuario se compromete a utilizar la plataforma únicamente con
            fines legales y respetando los derechos de terceros.
          </p>
          <p>No está permitido:</p>
          <ul className="list-disc ml-7">
            <li>Intentar acceder a información de otros usuarios.</li>
            <li>Alterar el funcionamiento del sistema.</li>
            <li>Utilizar la plataforma para actividades ilícitas.</li>
          </ul>
        </div>
        <div className="my-7">
          <h3 className="font-semibold text-xl">
            4. Responsabilidad sobre la información
          </h3>
          <p>
            Cada usuario es responsable de los datos que registra dentro de
            Turno Fácil, incluyendo información de alumnos, profesores y
            negocios.
          </p>
        </div>
        <div className="my-7">
          <h3 className="font-semibold text-xl">5. Disponibilidad</h3>
          <p>
            Nos esforzamos por mantener el servicio disponible de forma
            continua. Sin embargo, pueden existir interrupciones por
            mantenimiento, actualizaciones o causas ajenas a nuestro control.
          </p>
        </div>
        <div className="my-7">
          <h3 className="font-semibold text-xl">6. Modificaciones</h3>
          <p>
            Turno Fácil podrá incorporar nuevas funcionalidades, modificar las
            existentes o actualizar estos términos cuando resulte necesario.
          </p>
        </div>
        <div className="my-7">
          <h3 className="font-semibold text-xl">7. Suspensión de cuentas</h3>
          <p>
            Podremos suspender o eliminar cuentas que incumplan estos términos o
            que utilicen la plataforma de manera indebida.
          </p>
        </div>
        <div className="my-7">
          <h3 className="font-semibold text-xl">
            8. Limitación de responsabilidad
          </h3>
          <p>
            Turno Fácil actúa como una herramienta de gestión. Cada negocio es
            responsable de la información que administra y de la organización de
            sus actividades.
          </p>
        </div>
        <div className="mt-7">
          <h3 className="font-semibold text-xl">9. Contacto</h3>
          <p>
            Ante cualquier consulta relacionada con estos términos, podés
            comunicarte mediante los canales oficiales de Turno Fácil.
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
