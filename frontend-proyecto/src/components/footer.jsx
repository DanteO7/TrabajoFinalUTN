import { FooterDivider } from "flowbite-react";
import { FaGithub, FaInstagram, FaWhatsapp, FaYoutube } from "react-icons/fa";
import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="p-6 mx-auto lg:px-[10%] flex flex-col gap-3">
      <div className="flex justify-between items-center flex-col-reverse gap-4 lg:gap-15 md:flex-row">
        <div>
          <p className="m-2 text-center md:text-left ">
            Teléfono:(+54) 3400-532514 | Email: dante.orsetti@gmail.com
          </p>
          <p className="m-2 text-center md:text-left">
            &copy;2026 Turno Facil. Todos los derechos reservados.
          </p>
        </div>
        <div className="flex gap-5 text-3xl">
          <FaInstagram
            className="cursor-pointer hover:text-black hover:dark:text-[#ccc] transition-all duration-200"
            onClick={() =>
              window.open("https://www.instagram.com/dante_ksx", "_blank")
            }
          />
          <FaWhatsapp
            className="cursor-pointer hover:text-black hover:dark:text-[#ccc] transition-all duration-200"
            onClick={() => window.open("https://wa.me/5493400532514", "_blank")}
          />
          <FaGithub
            className="cursor-pointer hover:text-black hover:dark:text-[#ccc] transition-all duration-200"
            onClick={() => window.open("https://github.com/DanteO7", "_blank")}
          />
          <FaYoutube
            className="cursor-pointer hover:text-black hover:dark:text-[#ccc] transition-all duration-200"
            onClick={() =>
              window.open(
                "https://www.linkedin.com/in/dante-orsetti-05a1453b6/",
                "_blank",
              )
            }
          />
        </div>
      </div>
      <hr className="text-gray-400" />
      <p className="text-center text-[0.8rem] text-gray-700">
        <Link href="/aviso-legal" className="hover:text-gray-900">
          Aviso Legal
        </Link>{" "}
        |{" "}
        <Link href="/politica-y-privacidad" className="hover:text-gray-900">
          Política de Privacidad
        </Link>{" "}
        |{" "}
        <Link href="/terminos-y-condiciones" className="hover:text-gray-900">
          Términos y Condiciones
        </Link>
      </p>
    </footer>
  );
}
