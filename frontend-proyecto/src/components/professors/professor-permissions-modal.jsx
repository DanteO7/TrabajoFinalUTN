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
import { useTranslation } from "react-i18next";

const PERMISSION_SECTION_ORDER = [
  "tenant",
  "student",
  "professor",
  "activity",
  "speciality",
  "class",
  "reservation",
  "payment",
  "studentPlan",
  "news",
  "exercise",
  "routine",
  "invitation",
  "other",
];

function getPermissionSection(permissionName) {
  if (permissionName.startsWith("STUDENT_PLAN_")) {
    return "studentPlan";
  }

  const prefix = permissionName.split("_")[0];
  return (
    {
      TENANT: "tenant",
      STUDENT: "student",
      PROFESSOR: "professor",
      ACTIVITY: "activity",
      SPECIALITY: "speciality",
      CLASS: "class",
      RESERVATION: "reservation",
      PAYMENT: "payment",
      NEWS: "news",
      EXERCISE: "exercise",
      ROUTINE: "routine",
      INVITATION: "invitation",
    }[prefix] ?? "other"
  );
}

function errorMessage(error, t) {
  const response = error?.response?.data;
  return (
    response?.message ||
    (typeof response === "string" ? response : null) ||
    t("professorPermissions.saveError")
  );
}

export default function ProfessorPermissionsModal({
  tenantId,
  professor,
  close,
  onSaved,
}) {
  const { t } = useTranslation();
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
    onError: (error) => setErrorMessageModal(errorMessage(error, t)),
  });

  return (
    <Modal open={true} onClose={close}>
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-2xl font-bold">
            {t("professorPermissions.title", {
              name: `${professor.user.name} ${professor.user.surname}`,
            })}
          </h2>
          <p className="text-gray-500 mt-1">
            {t("professorPermissions.description")}
          </p>
        </div>

        {isTenantLoading || isLoading ? (
          <Loading />
        ) : isTenantError || isError ? (
          <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">
            {errorMessage(tenantError ?? error, t)}
          </div>
        ) : isOwner ? (
          <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">
            {t("professorPermissions.owner")}
          </div>
        ) : (
          <>
            {configurablePermissions.length === 0 ? (
              <p className="text-gray-600">
                {t("professorPermissions.empty")}
              </p>
            ) : (
              <div className="flex flex-col gap-5 max-h-[55dvh] overflow-y-auto pr-1">
                {groupedPermissions.map(([section, sectionPermissions]) => (
                  <section key={section} className="flex flex-col gap-3">
                    <h3 className="border-b border-gray-300 pb-1 text-lg font-semibold text-gray-700">
                      {t(`professorPermissions.sections.${section}`)}
                    </h3>
                    {sectionPermissions.map((permission) => {
                      const [resourcePrefix, action] =
                        permission.name.split(/_(?=[^_]+$)/);
                      const resourceKey =
                        resourcePrefix === "STUDENT_PLAN"
                          ? "studentPlans"
                          : {
                              TENANT: "business",
                              STUDENT: "students",
                              PROFESSOR: "professors",
                              ACTIVITY: "activities",
                              SPECIALITY: "professions",
                              CLASS: "classes",
                              RESERVATION: "reservations",
                              PAYMENT: "payments",
                              NEWS: "news",
                              EXERCISE: "exercises",
                              ROUTINE: "routines",
                              INVITATION: "invitations",
                            }[resourcePrefix];
                      const label = resourceKey
                        ? `${t(`professorPermissions.actions.${action.toLowerCase()}`)} ${t(`professorPermissions.resources.${resourceKey}`)}`
                        : permission.name.replaceAll("_", " ");
                      const description = resourceKey
                        ? t(`professorPermissions.descriptions.${action.toLowerCase()}`, {
                            resource: t(
                              `professorPermissions.resources.${resourceKey}`,
                            ),
                          })
                        : t("professorPermissions.defaultLabel");
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
                                ? t("professorPermissions.required")
                                : description}
                            </p>
                            {permission.isOverridden && (
                              <p className="text-xs text-[#bf5260] mt-1">
                                {t("professorPermissions.custom")}
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
                                ? t("professorPermissions.enabled")
                                : t("professorPermissions.disabled")
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
              <WhiteButton
                text={t("professorPermissions.cancel")}
                onClick={close}
                textSmall={true}
              />
              <BlackButton
                text={
                  saveMutation.isPending
                    ? t("professorPermissions.saving")
                    : t("professorPermissions.save")
                }
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
