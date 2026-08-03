import { useQuery } from "@tanstack/react-query";
import {
  FaUsers,
  FaChalkboardTeacher,
  FaCalendarAlt,
  FaRunning,
  FaMoneyBillWave,
  FaUserShield,
  FaBookOpen,
} from "react-icons/fa";
import { Link } from "wouter";
import { getTenantById } from "../services/tenant";
import MainLayout from "../layouts/main-layout";
import { IoArrowBack } from "react-icons/io5";
import { useLocation } from "wouter";
import Loading from "../components/loading";

export default function Tenant({ id }) {
  const [, setLocation] = useLocation();

  const {
    data: tenant,
    isLoading,
    isError,
    error: backendError,
  } = useQuery({
    queryKey: ["tenantById", id],
    queryFn: () => getTenantById(id),
  });

  const sections = {
    Tenant: [
      {
        title: "Clases",
        description: "Administrá las clases.",
        icon: <FaCalendarAlt size={30} />,
        href: "clases",
      },
      {
        title: "Alumnos",
        description: "Administrá los alumnos del espacio.",
        icon: <FaUsers size={30} />,
        href: "alumnos",
      },
      {
        title: "Profesores",
        description: "Visualizá y gestioná profesores.",
        icon: <FaChalkboardTeacher size={30} />,
        href: "profesores",
      },
      {
        title: "Actividades",
        description: "Gestioná actividades.",
        icon: <FaRunning size={30} />,
        href: "actividades",
      },
      {
        title: "Profesiones",
        description: "Configurá profesiones.",
        icon: <FaBookOpen size={30} />,
        href: "profesiones",
      },
      // {
      //   title: "Pagos",
      //   description: "Consultá pagos.",
      //   icon: <FaMoneyBillWave size={30} />,
      //   href: "pagos",
      // },
      {
        title: "Planes de Alumnos",
        description: "Administrá los planes de tus alumnos.",
        icon: <FaUserShield size={30} />,
        href: "planes",
      },
      // {
      //   title: "Grupos",
      //   description: "Administrá roles y permisos.",
      //   icon: <FaUserShield size={30} />,
      //   href: "grupos",
      // },
    ],

    Professor: [
      {
        title: "Clases",
        description: "Tus clases.",
        icon: <FaCalendarAlt size={30} />,
        href: "clases",
      },
      {
        title: "Profesores",
        description: "Ver profesores.",
        icon: <FaChalkboardTeacher size={30} />,
        href: "profesores",
      },
      {
        title: "Actividades",
        description: "Actividades disponibles.",
        icon: <FaRunning size={30} />,
        href: "actividades",
      },
      {
        title: "Profesiones",
        description: "Configurá profesiones.",
        icon: <FaBookOpen size={30} />,
        href: "profesiones",
      },
      // {
      //   title: "Pagos",
      //   description: "Tus pagos.",
      //   icon: <FaMoneyBillWave size={30} />,
      //   href: "pagos",
      // },
    ],

    Student: [
      {
        title: "Clases",
        description: "Tus clases.",
        icon: <FaCalendarAlt size={30} />,
        href: "clases",
      },
      {
        title: "Profesores",
        description: "Conocé a tus profesores.",
        icon: <FaChalkboardTeacher size={30} />,
        href: "profesores",
      },
      {
        title: "Actividades",
        description: "Actividades disponibles.",
        icon: <FaRunning size={30} />,
        href: "actividades",
      },
      // {
      //   title: "Pagos",
      //   description: "Consultá tus pagos.",
      //   icon: <FaMoneyBillWave size={30} />,
      //   href: "pagos",
      // },
    ],
  };

  const roleConfig = {
    Tenant: {
      text: "Dueño",
      className: "border-purple-600 text-purple-600",
    },
    Professor: {
      text: "Profesor",
      className: "border-blue-600 text-blue-600",
    },
    Student: {
      text: "Alumno",
      className: "border-yellow-600 text-yellow-600",
    },
  };

  const role = roleConfig[tenant?.role];

  const cards = sections[tenant?.role];

  return (
    <MainLayout>
      <div className="w-full max-w-6xl mt-12">
        <button
          onClick={() => setLocation("/tu-espacio")}
          className="text-gray-500 hover:text-black transition flex items-center gap-2 mb-6 cursor-pointer"
        >
          <IoArrowBack />
          Tu espacio
        </button>
        {isLoading ? (
          <Loading />
        ) : isError ? (
          <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-700">
            {backendError?.response?.data?.message ||
              backendError?.response?.data ||
              "Ocurrió un error al cargar el negocio."}
          </div>
        ) : (
          <div className="flex flex-col justify-between items-start flex-wrap gap-5">
            <div>
              <h1 className="text-4xl min-[900px]:text-5xl font-bold">
                {tenant?.name}
              </h1>

              <p className="text-gray-500 mt-2">
                Administrado por {tenant?.ownerUser.name}{" "}
                {tenant?.ownerUser.surname}
              </p>
              <div className="flex my-2 gap-2 flex-wrap">
                <span
                  className={`rounded-full px-3 py-1 text-sm border
                ${
                  tenant?.isActive
                    ? "border-green-600 text-green-600"
                    : "border-red-600 text-red-600"
                }`}
                >
                  {tenant?.isActive ? "Activo" : "Inactivo"}
                </span>

                <span
                  className={`rounded-full px-3 py-1 text-sm border ${role?.className}`}
                >
                  {role?.text}
                </span>
              </div>
              <p className="text-gray-500 mt-1">
                Desde acá podés administrar todas las áreas de tu negocio.
              </p>
            </div>

            <div className="grid gap-6 mt-10 min-[800px]:grid-cols-2 min-[1000px]:grid-cols-3 w-full">
              {" "}
              {cards?.map((section) => (
                <Link
                  key={section.href}
                  href={`/tu-espacio/${tenant?.id}/${section.href}`}
                >
                  <div className="cursor-pointer rounded-xl border p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col gap-4">
                    <div className="text-[#FF8A90]">{section.icon}</div>

                    <div>
                      <h3 className="font-semibold text-xl">{section.title}</h3>

                      <p className="text-gray-500 mt-2">
                        {section.description}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
