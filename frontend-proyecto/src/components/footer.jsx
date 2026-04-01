import { FooterDivider } from "flowbite-react";

export default function Footer() {
  return (
    <footer className="p-6 mx-auto lg:px-[10%] bg-[#ede9ee]">
      <div className="flex justify-between items-center flex-col-reverse gap-3.5 md:flex-row">
        <div>
          <p className="m-2 text-center md:text-left ">
            Teléfono:(+54) 3400-532514 | Email: dante.orsetti@gmail.com
          </p>
          <p className="m-2 text-center md:text-left">
            &copy;2026 Turno Facil. Todos los derechos reservados.
          </p>
        </div>
        <div className="flex gap-5">
          <a href="https://github.com/DanteO7/TrabajoFinalUTN" target="_blank">
            <img className="w-7" src="/github.png" alt="icono de github" />
          </a>
          <a href="https://github.com/DanteO7/TrabajoFinalUTN" target="_blank">
            <img
              className="w-7"
              src="/instagram.png"
              alt="icono de instagram"
            />
          </a>
          <a href="https://github.com/DanteO7/TrabajoFinalUTN" target="_blank">
            <img className="w-7" src="/facebook.png" alt="icono de facebook" />
          </a>
          <a href="https://github.com/DanteO7/TrabajoFinalUTN" target="_blank">
            <img className="w-7" src="/whatsapp.png" alt="icono de whatsapp" />
          </a>
        </div>
      </div>
      <FooterDivider />
      <p className="text-center text-[0.8rem]">
        Aviso Legal | Política de Privacidad
      </p>
    </footer>
  );
}
