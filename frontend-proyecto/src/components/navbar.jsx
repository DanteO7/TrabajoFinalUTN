import { Link } from "wouter";
import { useLocation } from "wouter";

export default function Navbar({ user }) {
  const [location] = useLocation();
  const linkClass = (path) =>
    `px-2 border-b  py-1 rounded-[6px] hover:text-gray-400 ${location === path ? "bg-gray-300" : " "}`;

  return (
    <div className="hidden w-80 justify-self-end lg:block border-r px-10 pb-5">
      <div className="mb-5">
        <span className="font-semibold text-xl">
          {user?.name} {user?.surname}
        </span>
      </div>

      <nav>
        <ul className="flex flex-col gap-3">
          <Link className={linkClass("/profile")} href="profile">
            Perfil
          </Link>
          <Link className={linkClass("/settings")} href="settings">
            Ajustes
          </Link>
        </ul>
      </nav>
    </div>
  );
}
