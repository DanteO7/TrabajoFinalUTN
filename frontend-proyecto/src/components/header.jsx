import { useState } from "react";
import { IoPersonSharp } from "react-icons/io5";
import { IoMdSettings } from "react-icons/io";
import { Link, useLocation } from "wouter";
import { useAuthStore } from "../store/auth-store";

export default function Header() {
  const [menu, setMenu] = useState(false);
  const [location] = useLocation();
  const { isAuthenticated, user } = useAuthStore();

  const handleHomeClick = (e) => {
    if (location === "/") {
      e.preventDefault();
      window.location.href = "/";
    }
  };

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

        <Link href="/" onClick={handleHomeClick}>
          <img
            src="/logo.png"
            alt="logo de turno facil"
            className="w-28 cursor-pointer"
          />
        </Link>

        <nav className="hidden min-[900px]:flex gap-8"></nav>

        <div className="flex gap-5 items-center">
          {isAuthenticated && (
            <div className="flex items-center gap-5">
              {user?.roles?.includes("Admin") && (
                <>
                  <Link
                    className="hidden min-[900px]:flex cursor-pointer transition-all duration-200 bg-[#eaeaea] font-semibold text-[#333] rounded-xl px-2.5 py-1 max-[900px]:text-[13px]"
                    href="usuarios"
                  >
                    Usuarios
                  </Link>
                  <Link
                    className="hidden min-[900px]:flex cursor-pointer transition-all duration-200 bg-[#eaeaea] font-semibold text-[#333] rounded-xl px-2.5 py-1 max-[900px]:text-[13px]"
                    href="usuarios"
                  >
                    Planes
                  </Link>
                </>
              )}
              <Link
                href="/tu-espacio"
                className="min-[900px]:flex cursor-pointer transition-all duration-200 bg-[#eaeaea] font-semibold text-[#333] rounded-xl px-2.5 py-1 max-[900px]:text-[13px]"
              >
                Tu espacio
              </Link>
            </div>
          )}
          {isAuthenticated ? (
            <Link className="hidden min-[900px]:flex" href="/perfil">
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

          <Link className="hidden min-[900px]:flex">
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
          className="cursor-pointer self-end text-2xl leading-none"
        >
          ✕
        </button>

        <div className="flex flex-col justify-between h-full">
          <nav>
            <ul className="flex flex-col gap-4">
              <Link
                href="/"
                onClick={() => {
                  handleHomeClick();
                  setMenu(false);
                }}
                className="cursor-pointer transition-all duration-200"
              >
                Inicio
              </Link>
              <Link
                href="perfil"
                onClick={() => setMenu(false)}
                className="cursor-pointer transition-all duration-200"
              >
                Perfil
              </Link>
              <Link
                href="tu-espacio"
                onClick={() => setMenu(false)}
                className="cursor-pointer transition-all duration-200"
              >
                Tu espacio
              </Link>
              {user?.roles?.includes("Admin") && (
                <>
                  <Link
                    href="usuarios"
                    onClick={() => setMenu(false)}
                    className="cursor-pointer transition-all duration-200"
                  >
                    Usuarios
                  </Link>
                  <Link
                    href="usuarios"
                    onClick={() => setMenu(false)}
                    className="cursor-pointer transition-all duration-200"
                  >
                    Planes
                  </Link>
                </>
              )}
            </ul>
          </nav>
          <Link onClick={() => setMenu(false)}>
            <IoMdSettings size={22} />
          </Link>
        </div>
      </div>
    </header>
  );
}
