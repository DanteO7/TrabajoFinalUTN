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
  FaMoneyBillWave,
  FaChartBar,
  FaUserShield,
} from "react-icons/fa";
import { Link } from "wouter";
import { getTenantById } from "../services/tenant";
import MainLayout from "../layouts/main-layout";
import { IoArrowBack } from "react-icons/io5";
import { useLocation } from "wouter";
import Loading from "../components/loading";
import { useState } from "react";
import BlackButton from "../components/buttons/black-button";
import RedButton from "../components/buttons/red-button";
import { getUnreadNewsCount } from "../services/news";
import EditTenantModal from "../components/tenant/edit-tenant-modal";
import {
  FaFacebook,
  FaInstagram,
  FaTiktok,
  FaLinkedin,
  FaYoutube,
  FaWhatsapp,
} from "react-icons/fa";
import { FaListCheck, FaXTwitter } from "react-icons/fa6";
import { useTenantStore } from "../store/tenant-store";

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
    refetchInterval: 30000,
    refetchIntervalInBackground: true,
  });

  const PLATFORM_ICONS = {
    facebook: FaFacebook,
    instagram: FaInstagram,
    tiktok: FaTiktok,
    x: FaXTwitter,
    linkedin: FaLinkedin,
    youtube: FaYoutube,
    whatsapp: FaWhatsapp,
  };

  const sections = [
    {
      title: "Novedades",
      description: "Mira las novedades del negocio.",
      icon: <FaBell size={35} />,
      href: "novedades",
      permission: "NEWS_READ",
    },
    {
      title: "Clases",
      description: "Administrá las clases.",
      icon: <FaCalendarAlt size={35} />,
      href: "clases",
      permission: "CLASS_READ",
    },
    {
      title: "Alumnos",
      description: "Administrá los alumnos del espacio.",
      icon: <FaUsers size={35} />,
      href: "alumnos",
      permission: "STUDENT_READ",
    },
    {
      title: "Profesores",
      description: "Visualizá y gestioná profesores.",
      icon: <FaChalkboardTeacher size={35} />,
      href: "profesores",
      permission: "PROFESSOR_READ",
    },
    {
      title: "Actividades",
      description: "Gestioná actividades.",
      icon: <FaRunning size={35} />,
      href: "actividades",
      permission: "ACTIVITY_READ",
    },
    {
      title: "Profesiones",
      description: "Configurá profesiones.",
      icon: <FaBookOpen size={35} />,
      href: "profesiones",
      permission: "SPECIALITY_READ",
    },
    {
      title: "Rutinas",
      description: "Configurá rutinas de entrenamiento.",
      icon: <FaListCheck size={35} />,
      href: "rutinas",
      permission: "ROUTINE_READ",
    },
    {
      title: "Ejercicios",
      description: "Gestioná ejercicios.",
      icon: <FaDumbbell size={35} />,
      href: "ejercicios",
      permission: "EXERCISE_READ",
    },
    {
      title: "Estadísticas",
      description: "Consultá el rendimiento de tu negocio.",
      icon: <FaChartBar size={35} />,
      href: "estadisticas",
      ownerOnly: true,
    },
    {
      title: "Permisos",
      description: "Configurá los permisos de tus profesores.",
      icon: <FaUserShield size={35} />,
      href: "permisos",
      ownerOnly: true,
    },
    {
      title: "Pagos",
      description: "Consultá pagos.",
      icon: <FaMoneyBillWave size={35} />,
      href: "pagos",
      permission: "PAYMENT_READ",
    },
    {
      title: "Planes de Alumnos",
      description: "Administrá los planes de tus alumnos.",
      icon: <FaTags size={35} />,
      href: "planes",
      permission: "STUDENT_PLAN_READ",
    },
    {
      title: "Reservas",
      description: "Tus próximas clases.",
      icon: <FaClipboardList size={35} />,
      href: "reservas",
      permission: "RESERVATION_READ",
      onlyStudent: true,
    },
  ];

  const userPermissions = useTenantStore((state) =>
    state.getUserPermissions(id),
  );

  const userRoles = useTenantStore((state) => state.getUserRoles(id));

  const cards = userPermissions
    ? sections.filter((section) => {
        const isOwner = tenant?.role === "Tenant";

        if (section.ownerOnly && !isOwner) {
          return false;
        }

        if (
          ["ejercicios", "rutinas"].includes(section.href) &&
          tenant?.tenantPlan?.includesExercisesAndRoutines !== true
        ) {
          return false;
        }

        const hasPermission = section.ownerOnly
          ? isOwner
          : userPermissions.permissions.includes(section.permission);

        const isStudentOnly = section.onlyStudent === true;

        const isStudent = userRoles.includes("Student");

        return hasPermission && (!isStudentOnly || isStudent);
      })
    : [];

  const roleConfig = {
    Admin: {
      text: "Administrador",
      className: "bg-red-300 text-red-600",
    },
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

  const role = userRoles.map((role) => roleConfig[role]).find(Boolean);

  const canUpdateTenant =
    userPermissions?.permissions?.includes("TENANT_UPDATE") ?? false;

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
          <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">
            {backendError?.response?.data?.message ||
              backendError?.response?.data ||
              "Ocurrió un error al cargar el negocio."}
          </div>
        ) : (
          <div className="flex flex-col justify-between items-start flex-wrap gap-5">
            <div className="flex min-w-0 flex-col gap-2 w-full">
              <div className="flex min-w-0 flex-wrap items-center gap-3 justify-between w-full">
                <h1 className="min-w-0 wrap-break-word text-4xl font-bold min-[900px]:text-5xl">
                  {tenant?.name}
                </h1>
                {tenant?.role === "Tenant" &&
                  tenant.onboardingCompleted === false && (
                    <RedButton
                      text="Completar primeros pasos"
                      onClick={() =>
                        setLocation(`/tu-espacio/${tenant.id}/primeros-pasos`)
                      }
                      wfit
                      textSmall
                    />
                  )}
              </div>

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

              {canUpdateTenant && (
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
              {tenant?.role == "Tenant" && (
                <p className="text-gray-500">
                  Vencimiento:{" "}
                  {tenant?.paymentDueDate
                    ? new Date(tenant.paymentDueDate).toLocaleDateString(
                        "es-AR",
                      )
                    : "-"}
                </p>
              )}
            </div>
            <p className="text-gray-500 mt-1">
              {tenant?.role == "Student"
                ? "Desde acá podés gestionar tus clases, reservas y pagos."
                : "Desde acá podés administrar todas las áreas de tu negocio."}
            </p>
            <div className="grid gap-4 mt-3 min-[800px]:grid-cols-2 min-[1000px]:grid-cols-3 w-full">
              {newsCard && (
                <Link href={`/tu-espacio/${tenant?.id}/novedades`}>
                  <div
                    className={`relative bg-[#efecf0] cursor-pointer rounded-lg ${unreadCount?.unreadCount > 0 && "bg-red-100"} border border-gray-400 px-4 py-3 min-[900px]:p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex min-[900px]:flex-col gap-4 max-[900px]:items-center`}
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
                      <p className="text-gray-500 max-[900px]:text-[12px]">
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
                  <div className="cursor-pointer bg-[#efecf0] rounded-lg border border-gray-400 px-4 py-3 min-[900px]:p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex min-[900px]:flex-col gap-4 max-[900px]:items-center">
                    <div className="text-[#fa7282]">{section.icon}</div>

                    <div>
                      <h3 className="font-semibold text-[19px]">
                        {section.title}
                      </h3>

                      <p className="text-gray-500 max-[900px]:text-[12px]">
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
