import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Modal from "../modals/modal";
import ToggleInput from "../toggle-input";
import BlackButton from "../buttons/black-button";
import WhiteButton from "../buttons/white-button";
import Loading from "../loading";
import ErrorModal from "../modals/error-modal";
import { getTenantById } from "../../services/tenant";
import {
  getProfessorPermissions,
  updateProfessorPermissions,
} from "../../services/professor";

const PERMISSION_DETAILS = {
  TENANT_READ: ["Consultar el negocio", "Ver la información del negocio."],
  STUDENT_READ: ["Consultar alumnos", "Ver el listado y los datos de alumnos."],
  STUDENT_CREATE: ["Crear alumnos", "Dar de alta alumnos en el negocio."],
  STUDENT_UPDATE: ["Editar alumnos", "Modificar la información de alumnos."],
  STUDENT_DELETE: ["Eliminar alumnos", "Dar de baja alumnos."],
  PROFESSOR_READ: ["Consultar profesores", "Ver el listado de profesores."],
  ACTIVITY_READ: ["Consultar actividades", "Ver las actividades del negocio."],
  ACTIVITY_CREATE: ["Crear actividades", "Agregar actividades."],
  ACTIVITY_UPDATE: ["Editar actividades", "Modificar actividades existentes."],
  ACTIVITY_DELETE: ["Eliminar actividades", "Eliminar actividades."],
  SPECIALITY_READ: [
    "Consultar profesiones",
    "Ver las profesiones configuradas.",
  ],
  SPECIALITY_CREATE: ["Crear profesiones", "Agregar profesiones."],
  SPECIALITY_UPDATE: ["Editar profesiones", "Modificar profesiones."],
  SPECIALITY_DELETE: ["Eliminar profesiones", "Eliminar profesiones."],
  CLASS_READ: ["Consultar clases", "Ver las clases y sus detalles."],
  CLASS_CREATE: ["Crear clases", "Programar nuevas clases."],
  CLASS_UPDATE: ["Editar clases", "Modificar clases programadas."],
  CLASS_DELETE: ["Eliminar clases", "Eliminar clases programadas."],
  RESERVATION_READ: ["Consultar reservas", "Ver las reservas de clases."],
  RESERVATION_CREATE: ["Crear reservas", "Reservar alumnos en clases."],
  RESERVATION_DELETE: ["Eliminar reservas", "Cancelar reservas."],
  PAYMENT_READ: ["Consultar pagos", "Ver pagos registrados."],
  PAYMENT_CREATE: ["Registrar pagos", "Crear registros de pago."],
  PAYMENT_UPDATE: ["Editar pagos", "Modificar registros de pago."],
  PAYMENT_DELETE: ["Eliminar pagos", "Eliminar registros de pago."],
  STUDENT_PLAN_READ: ["Consultar planes", "Ver planes de alumnos."],
  STUDENT_PLAN_CREATE: ["Crear planes", "Agregar planes de alumnos."],
  STUDENT_PLAN_UPDATE: ["Editar planes", "Modificar planes existentes."],
  STUDENT_PLAN_DELETE: ["Eliminar planes", "Eliminar planes de alumnos."],
  NEWS_READ: ["Consultar novedades", "Ver las novedades del negocio."],
  NEWS_CREATE: ["Crear novedades", "Publicar novedades."],
  NEWS_UPDATE: ["Editar novedades", "Modificar novedades publicadas."],
  NEWS_DELETE: ["Eliminar novedades", "Eliminar novedades publicadas."],
  EXERCISE_READ: ["Consultar ejercicios", "Ver ejercicios."],
  EXERCISE_CREATE: ["Crear ejercicios", "Agregar ejercicios."],
  EXERCISE_UPDATE: ["Editar ejercicios", "Modificar ejercicios existentes."],
  EXERCISE_DELETE: ["Eliminar ejercicios", "Eliminar ejercicios."],
  ROUTINE_READ: ["Consultar rutinas", "Ver rutinas de entrenamiento."],
  ROUTINE_CREATE: ["Crear rutinas", "Agregar rutinas."],
  ROUTINE_UPDATE: ["Editar rutinas", "Modificar rutinas existentes."],
  ROUTINE_DELETE: ["Eliminar rutinas", "Eliminar rutinas."],
  INVITATION_READ: ["Consultar invitaciones", "Ver invitaciones del negocio."],
  INVITATION_CREATE: ["Crear invitaciones", "Invitar usuarios al negocio."],
  INVITATION_DELETE: ["Eliminar invitaciones", "Cancelar invitaciones."],
};

const PERMISSION_SECTION_NAMES = {
  TENANT: "Negocio",
  STUDENT: "Alumnos",
  PROFESSOR: "Profesores",
  ACTIVITY: "Actividades",
  SPECIALITY: "Profesiones",
  CLASS: "Clases",
  RESERVATION: "Reservas",
  PAYMENT: "Pagos",
  NEWS: "Novedades",
  EXERCISE: "Ejercicios",
  ROUTINE: "Rutinas",
  INVITATION: "Invitaciones",
  OTHER: "Otros",
};

const PERMISSION_SECTION_ORDER = [
  "Negocio",
  "Alumnos",
  "Profesores",
  "Actividades",
  "Profesiones",
  "Clases",
  "Reservas",
  "Pagos",
  "Planes de alumnos",
  "Novedades",
  "Ejercicios",
  "Rutinas",
  "Invitaciones",
  "Otros",
];

function getPermissionSection(permissionName) {
  if (permissionName.startsWith("STUDENT_PLAN_")) {
    return "Planes de alumnos";
  }

  const prefix = permissionName.split("_")[0];
  return PERMISSION_SECTION_NAMES[prefix] ?? PERMISSION_SECTION_NAMES.OTHER;
}

function errorMessage(error) {
  const response = error?.response?.data;
  return (
    response?.message ||
    (typeof response === "string" ? response : null) ||
    "No se pudieron guardar los permisos. Intentá nuevamente."
  );
}

export default function ProfessorPermissionsModal({
  tenantId,
  professor,
  close,
  onSaved,
}) {
  const queryClient = useQueryClient();
  const permissionsKey = ["professorPermissions", tenantId, professor.id];
  const [draft, setDraft] = useState(null);
  const [errorMessageModal, setErrorMessageModal] = useState(null);
  const {
    data: tenant,
    isLoading: isTenantLoading,
    isError: isTenantError,
    error: tenantError,
  } = useQuery({
    queryKey: ["tenantById", tenantId],
    queryFn: () => getTenantById(tenantId),
  });
  const {
    data: permissions = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: permissionsKey,
    queryFn: () => getProfessorPermissions(professor.id),
  });

  const isOwner = Number(professor.userId) === Number(tenant?.ownerUserId);

  const initialDraft = Object.fromEntries(
    permissions.map((permission) => [permission.name, permission.isAllowed]),
  );
  const currentDraft = draft ?? initialDraft;
  const configurablePermissions = useMemo(
    () =>
      permissions.filter(
        (permission) =>
          ![
            "RESERVATION_CHANGE_STATUS",
            "GROUP_READ",
            "STUDENT_CREATE",
          ].includes(permission.name),
      ),
    [permissions],
  );
  const groupedPermissions = useMemo(() => {
    const groups = new Map();

    configurablePermissions.forEach((permission) => {
      const section = getPermissionSection(permission.name);
      const sectionPermissions = groups.get(section) ?? [];
      sectionPermissions.push(permission);
      groups.set(section, sectionPermissions);
    });

    return [...groups.entries()].sort(
      ([sectionA], [sectionB]) =>
        PERMISSION_SECTION_ORDER.indexOf(sectionA) -
        PERMISSION_SECTION_ORDER.indexOf(sectionB),
    );
  }, [configurablePermissions]);

  const changes = useMemo(
    () =>
      configurablePermissions
        .filter(
          (permission) =>
            currentDraft[permission.name] !== permission.isAllowed,
        )
        .map((permission) => ({
          name: permission.name,
          isAllowed: currentDraft[permission.name],
        })),
    [currentDraft, configurablePermissions],
  );

  const saveMutation = useMutation({
    mutationFn: () => updateProfessorPermissions(professor.id, changes),
    onSuccess: async (updatedPermissions) => {
      queryClient.setQueryData(permissionsKey, updatedPermissions);
      await queryClient.invalidateQueries({
        queryKey: permissionsKey,
      });
      close();
      onSaved();
    },
    onError: (error) => setErrorMessageModal(errorMessage(error)),
  });

  return (
    <Modal open={true} onClose={close}>
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-2xl font-bold">
            Permisos de {professor.user.name} {professor.user.surname}
          </h2>
          <p className="text-gray-500 mt-1">
            Los permisos mostrados reflejan el acceso efectivo actual.
          </p>
        </div>

        {isTenantLoading || isLoading ? (
          <Loading />
        ) : isTenantError || isError ? (
          <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">
            {errorMessage(tenantError ?? error)}
          </div>
        ) : isOwner ? (
          <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">
            El dueño del negocio tiene todos los permisos habilitados y no se
            pueden modificar.
          </div>
        ) : (
          <>
            {configurablePermissions.length === 0 ? (
              <p className="text-gray-600">
                No hay permisos de profesor configurados para este negocio.
              </p>
            ) : (
              <div className="flex flex-col gap-5 max-h-[55dvh] overflow-y-auto pr-1">
                {groupedPermissions.map(([section, sectionPermissions]) => (
                  <section key={section} className="flex flex-col gap-3">
                    <h3 className="border-b border-gray-300 pb-1 text-lg font-semibold text-gray-700">
                      {section}
                    </h3>
                    {sectionPermissions.map((permission) => {
                      const [label, description] = PERMISSION_DETAILS[
                        permission.name
                      ] ?? [
                        permission.name.replaceAll("_", " "),
                        "Permiso disponible para este profesor.",
                      ];
                      const isRequiredPermission =
                        permission.name === "TENANT_READ";

                      return (
                        <div
                          key={permission.name}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-lg border border-gray-300 bg-white/60 p-3"
                        >
                          <div className="min-w-0">
                            <p className="font-semibold">{label}</p>
                            <p className="text-sm text-gray-600">
                              {isRequiredPermission
                                ? "Este permiso es obligatorio para ingresar al negocio y no se puede desactivar."
                                : description}
                            </p>
                            {permission.isOverridden && (
                              <p className="text-xs text-[#bf5260] mt-1">
                                Configuración personalizada
                              </p>
                            )}
                          </div>
                          <ToggleInput
                            state={
                              isRequiredPermission ||
                              (currentDraft[permission.name] ?? false)
                            }
                            setState={(value) => {
                              if (isRequiredPermission) return;
                              setDraft((current) => ({
                                ...(current ?? initialDraft),
                                [permission.name]: value,
                              }));
                            }}
                            text={
                              isRequiredPermission ||
                              currentDraft[permission.name]
                                ? "Habilitado"
                                : "Deshabilitado"
                            }
                            gap={2}
                            disabled={isOwner || isRequiredPermission}
                          />
                        </div>
                      );
                    })}
                  </section>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-1">
              <WhiteButton text="Cancelar" onClick={close} textSmall={true} />
              <BlackButton
                text={saveMutation.isPending ? "Guardando..." : "Guardar"}
                onClick={() => saveMutation.mutate()}
                type="button"
                textSmall={true}
                disabled={
                  isOwner || changes.length === 0 || saveMutation.isPending
                }
              />
            </div>
          </>
        )}
      </div>
      {errorMessageModal && (
        <ErrorModal
          close={() => setErrorMessageModal(null)}
          message={errorMessageModal}
          isSuccesOrError
        />
      )}
    </Modal>
  );
}
