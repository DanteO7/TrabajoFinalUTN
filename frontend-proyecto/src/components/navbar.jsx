import { Link } from "wouter";
import { useLocation } from "wouter";

export default function Navbar({ user }) {
  const [location] = useLocation();
  const linkClass = (path) =>
    `px-2 border py-1 rounded-[6px] shadow-md ${location === path ? "text-[#efefef] bg-[#3f3f3f] border-black" : "bg-[#F1EEF3] border-gray-400"}`;

  return (
    <div className="hidden w-80 justify-self-end lg:block border-r px-10 pb-5">
      <div className="mb-5">
        <span className="font-semibold text-xl">
          {user?.name} {user?.surname}
        </span>
      </div>

      <nav>
        <ul className="flex flex-col gap-3">
          <Link className={linkClass("/perfil")} href="/perfil">
            Perfil
          </Link>
          <Link className={linkClass("/ajustes")} href="/ajustes">
            Ajustes
          </Link>
        </ul>
      </nav>
    </div>
  );
}
