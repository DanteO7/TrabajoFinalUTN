import { useQuery } from "@tanstack/react-query";
import {
  FaUsers,
  FaChalkboardTeacher,
  FaCalendarAlt,
  FaRunning,
  FaBookOpen,
  FaClipboardList,
  FaTags,
  FaBell,
  FaDumbbell,
} from "react-icons/fa";
import { Link } from "wouter";
import { getTenantById } from "../services/tenant";
import MainLayout from "../layouts/main-layout";
import { IoArrowBack } from "react-icons/io5";
import { useLocation } from "wouter";
import Loading from "../components/loading";
import { useState } from "react";
import BlackButton from "../components/buttons/black-button";
import { getUnreadNewsCount } from "../services/news";
import EditTenantModal from "../components/tenant/edit-tenant-modal";
import {
  FaFacebook,
  FaInstagram,
  FaTiktok,
  FaTwitter,
  FaLinkedin,
  FaYoutube,
  FaWhatsapp,
} from "react-icons/fa";
import { FaListCheck } from "react-icons/fa6";

export default function Tenant({ id }) {
  const [, setLocation] = useLocation();
  const [openEditAdressModal, setOpenEditAdressModal] = useState(false);

  const {
    data: tenant,
    isLoading,
    isError,
    error: backendError,
  } = useQuery({
    queryKey: ["tenantById", id],
    queryFn: () => getTenantById(id),
  });

  const PLATFORM_ICONS = {
    facebook: FaFacebook,
    instagram: FaInstagram,
    tiktok: FaTiktok,
    x: FaTwitter,
    linkedin: FaLinkedin,
    youtube: FaYoutube,
    whatsapp: FaWhatsapp,
  };

  const sections = {
    Tenant: [
      {
        title: "Novedades",
        description: "Mira las novedades del negocio y de la app.",
        icon: <FaBell size={35} />,
        href: "novedades",
      },
      {
        title: "Clases",
        description: "Administrá las clases.",
        icon: <FaCalendarAlt size={35} />,
        href: "clases",
      },
      {
        title: "Alumnos",
        description: "Administrá los alumnos del espacio.",
        icon: <FaUsers size={35} />,
        href: "alumnos",
      },
      {
        title: "Profesores",
        description: "Visualizá y gestioná profesores.",
        icon: <FaChalkboardTeacher size={35} />,
        href: "profesores",
      },
      {
        title: "Actividades",
        description: "Gestioná actividades.",
        icon: <FaRunning size={35} />,
        href: "actividades",
      },
      {
        title: "Profesiones",
        description: "Configurá profesiones.",
        icon: <FaBookOpen size={35} />,
        href: "profesiones",
      },
      {
        title: "Rutinas",
        description: "Configurá rutinas de entrenamiento.",
        icon: <FaListCheck size={35} />,
        href: "rutinas",
      },
      {
        title: "Ejercicios",
        description: "Gestioná ejercicios.",
        icon: <FaDumbbell size={35} />,
        href: "ejercicios",
      },
      // {
      //   title: "Pagos",
      //   description: "Consultá pagos.",
      //   icon: <FaMoneyBillWave size={35} />,
      //   href: "pagos",
      // },
      {
        title: "Planes de Alumnos",
        description: "Administrá los planes de tus alumnos.",
        icon: <FaTags size={35} />,
        href: "planes",
      },
      // {
      //   title: "Roles",
      //   description: "Administrá roles y permisos.",
      //   icon: <FaUserShield size={35} />,
      //   href: "roles",
      // },
    ],

    Professor: [
      {
        title: "Novedades",
        description: "Mira las novedades del negocio y de la app.",
        icon: <FaBell size={35} />,
        href: "novedades",
      },
      {
        title: "Clases",
        description: "Tus clases.",
        icon: <FaCalendarAlt size={35} />,
        href: "clases",
      },
      {
        title: "Profesores",
        description: "Ver profesores.",
        icon: <FaChalkboardTeacher size={35} />,
        href: "profesores",
      },
      {
        title: "Actividades",
        description: "Actividades disponibles.",
        icon: <FaRunning size={35} />,
        href: "actividades",
      },
      {
        title: "Profesiones",
        description: "Configurá profesiones.",
        icon: <FaBookOpen size={35} />,
        href: "profesiones",
      },
      {
        title: "Rutinas",
        description: "Configurá rutinas de entrenamiento.",
        icon: <FaListCheck size={35} />,
        href: "rutinas",
      },
      {
        title: "Ejercicios",
        description: "Gestioná ejercicios.",
        icon: <FaDumbbell size={35} />,
        href: "ejercicios",
      },
      // {
      //   title: "Pagos",
      //   description: "Tus pagos.",
      //   icon: <FaMoneyBillWave size={35} />,
      //   href: "pagos",
      // },
    ],

    Student: [
      {
        title: "Novedades",
        description: "Mira las novedades del negocio y de la app.",
        icon: <FaBell size={35} />,
        href: "novedades",
      },
      {
        title: "Clases",
        description: "Clases disponibles.",
        icon: <FaCalendarAlt size={35} />,
        href: "clases",
      },
      {
        title: "Profesores",
        description: "Conocé a tus profesores.",
        icon: <FaChalkboardTeacher size={35} />,
        href: "profesores",
      },
      {
        title: "Actividades",
        description: "Actividades disponibles.",
        icon: <FaRunning size={35} />,
        href: "actividades",
      },
      {
        title: "Reservas",
        description: "Tus proximas clases.",
        icon: <FaClipboardList size={35} />,
        href: "reservas",
      },
      {
        title: "Rutinas",
        description: "Configurá rutinas de entrenamiento.",
        icon: <FaListCheck size={35} />,
        href: "rutinas",
      },
      // {
      //   title: "Pagos",
      //   description: "Consultá tus pagos.",
      //   icon: <FaMoneyBillWave size={35} />,
      //   href: "pagos",
      // },
    ],
  };

  const roleConfig = {
    Tenant: {
      text: "Dueño",
      className: "bg-purple-300 text-purple-600",
    },
    Professor: {
      text: "Profesor",
      className: "bg-blue-300 text-blue-600",
    },
    Student: {
      text: "Alumno",
      className: "bg-orange-200 text-yellow-600",
    },
  };
  const role = roleConfig[tenant?.role];

  const cards = sections[tenant?.role];

  const { data: unreadCount } = useQuery({
    queryKey: ["unreadCount", tenant?.id],
    queryFn: () => getUnreadNewsCount(tenant?.id),
    enabled: !!tenant?.id,
  });

  const newsCard = cards?.find((c) => c.href === "novedades");
  const otherCards = cards?.filter((c) => c.href !== "novedades");

  return (
    <MainLayout>
      <div className="w-full max-w-6xl mt-12">
        <button
          onClick={() => setLocation("/tu-espacio")}
          className="text-gray-500 hover:text-black transition flex items-center gap-2 mb-6 cursor-pointer"
        >
          <IoArrowBack color="fc697b" />
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
            <div className="flex flex-col gap-2">
              <h1 className="text-4xl min-[900px]:text-5xl font-bold">
                {tenant?.name}
              </h1>

              <p className="text-gray-500">
                Administrado por {tenant?.ownerUser.name}{" "}
                {tenant?.ownerUser.surname}
              </p>

              {tenant?.socialNetworks &&
                Object.keys(tenant.socialNetworks).length > 0 && (
                  <div className="flex gap-3 text-3xl">
                    {Object.entries(tenant.socialNetworks).map(
                      ([platform, url]) => {
                        const Icon = PLATFORM_ICONS[platform];
                        if (!Icon) return null;

                        return (
                          <Icon
                            key={platform}
                            size={30}
                            className="cursor-pointer hover:text-black hover:dark:text-[#ccc] transition-all duration-200"
                            onClick={() => window.open(url, "_blank")}
                          />
                        );
                      },
                    )}
                  </div>
                )}

              {tenant?.address && (
                <p className="text-gray-500 mb-1">{tenant?.address}</p>
              )}

              {role.text == "Dueño" && (
                <BlackButton
                  text="Editar datos"
                  onClick={() => setOpenEditAdressModal(true)}
                  textSmall={true}
                  wfit={true}
                />
              )}

              <div className="flex mb-2 mt-1 gap-2 flex-wrap">
                <span
                  className={`rounded-full px-3 py-1 text-sm
                ${
                  tenant?.isActive
                    ? "bg-[#a1f3be] text-green-600"
                    : "bg-red-300 text-red-600"
                }`}
                >
                  {tenant?.isActive ? "Activo" : "Inactivo"}
                </span>

                <span
                  className={`flex items-center justify-center rounded-full px-3 py-1 text-sm ${role?.className}`}
                >
                  {role?.text}
                </span>
              </div>
            </div>
            <p className="text-gray-500 mt-1">
              Desde acá podés administrar todas las áreas de tu negocio.
            </p>
            <div className="grid gap-4 mt-3 min-[800px]:grid-cols-2 min-[1000px]:grid-cols-3 w-full">
              {newsCard && (
                <Link href={`/tu-espacio/${tenant?.id}/novedades`}>
                  <div
                    className={`relative cursor-pointer rounded-xl ${unreadCount?.unreadCount > 0 && "bg-red-100"} border px-4.5 py-3.25 min-[900px]:p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex min-[900px]:flex-col gap-4.5 max-[900px]:items-center`}
                  >
                    {unreadCount?.unreadCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-[#fc697b] text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-semibold">
                        {unreadCount.unreadCount}
                      </span>
                    )}
                    <div className="text-[#fa7282]">{newsCard.icon}</div>
                    <div>
                      <h3 className="font-semibold text-[19px]">
                        {newsCard.title}
                      </h3>
                      <p className="text-gray-500 max-[900px]:text-[13px]">
                        {newsCard.description}
                      </p>
                    </div>
                  </div>
                </Link>
              )}

              {otherCards?.map((section) => (
                <Link
                  key={section.href}
                  href={`/tu-espacio/${tenant?.id}/${section.href}`}
                >
                  <div className="cursor-pointer rounded-xl border px-4.5 py-3.25 min-[900px]:p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex min-[900px]:flex-col gap-4.5 max-[900px]:items-center">
                    <div className="text-[#fa7282]">{section.icon}</div>
                    <div>
                      <h3 className="font-semibold text-[19px]">
                        {section.title}
                      </h3>
                      <p className="text-gray-500 max-[900px]:text-[13px]">
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
      {openEditAdressModal && (
        <EditTenantModal
          tenant={tenant}
          close={() => setOpenEditAdressModal(false)}
        />
      )}
    </MainLayout>
  );
}
