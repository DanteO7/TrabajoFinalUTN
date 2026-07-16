import { useState } from "react";
import { IoPersonSharp } from "react-icons/io5";
import { IoMdSettings } from "react-icons/io";
import { Link } from "wouter";
import { useAuthStore } from "../store/auth-store";

export default function Header() {
  const [menu, setMenu] = useState(false);
  const { isAuthenticated } = useAuthStore();

  return (
    <header className="bg-[#222] w-full h-13 sticky top-0 z-30">
      <div className="text-[#ededed] grid grid-cols-[1fr_1.6fr_1fr] place-items-center items-center h-full">
        <div className="min-[900px]:hidden">
          <button
            className="flex flex-col gap-1.25 z-50 mx-1.5 mr-5"
            onClick={() => {
              setMenu(true);
            }}
          >
            <span className="w-6 h-0.75 rounded-4xl bg-[#ededed]"></span>
            <span className="w-6 h-0.75 rounded-4xl bg-[#ededed]"></span>
            <span className="w-6 h-0.75 rounded-4xl bg-[#ededed]"></span>
          </button>
        </div>
        <Link href="/">
          <img src="/logo.png" alt="logo de turno facil" className="w-28" />
        </Link>

        <nav className="hidden min-[900px]:flex gap-8"></nav>

        <div className="flex gap-5 items-center">
          {isAuthenticated && (
            <Link
              href="/tu-espacio"
              className="hidden min-[900px]:flex cursor-pointer transition-all duration-200 bg-[#eaeaea] font-semibold text-[#333] rounded-xl px-2.5 py-0.75"
            >
              Tu espacio
            </Link>
          )}
          {isAuthenticated ? (
            <Link href="/perfil">
              <IoPersonSharp size={22} />
            </Link>
          ) : (
            <Link
              href="/iniciar-sesion"
              className="border rounded-xl px-2 py-1 text-[13px]"
            >
              Inicia sesión
            </Link>
          )}

          <Link className="hidden min-[900px]:flex" href="ajustes">
            <IoMdSettings
              className="inline-block transition-transform duration-300 hover:scale-105 hover:rotate-70"
              size={22}
            />
          </Link>
        </div>
      </div>

      <div
        onClick={() => setMenu(false)}
        className={`fixed inset-0 z-40 bg-black transition-opacity duration-300 min-[900px]:hidden ${
          menu
            ? "opacity-50 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      />

      <div
        className={`fixed top-0 left-0 z-50 h-full w-64 text-[#ededed] bg-[#111] flex flex-col p-6 gap-6 transition-transform duration-300 ease-in-out min-[900px]:hidden ${
          menu ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setMenu(false)}
          className="cursor-pointer self-end text-2xl leading-none "
        >
          ✕
        </button>

        <div className="flex flex-col justify-between h-full">
          <nav>
            <ul className="flex flex-col gap-4">
              <Link
                href="/"
                className="cursor-pointer transition-all duration-200 "
              >
                Inicio
              </Link>
              <Link
                href="/perfil"
                className="cursor-pointer transition-all duration-200 "
              >
                Perfil
              </Link>
              <Link
                href="/tu-espacio"
                className="cursor-pointer transition-all duration-200 "
              >
                Tu espacio
              </Link>
              <li className="cursor-pointer transition-all duration-200 "></li>
            </ul>
          </nav>
          <Link href="/ajustes">
            <IoMdSettings size={22} />
          </Link>
        </div>
      </div>
    </header>
  );
}
