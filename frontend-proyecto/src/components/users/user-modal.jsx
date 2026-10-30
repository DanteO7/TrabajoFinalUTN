import { X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import Modal from "../modals/modal";
import Loading from "../loading";
import ConfirmModal from "../modals/confirm-modal";
import ErrorModal from "../modals/error-modal";
import { useAuthStore } from "../../store/auth-store";
import { deleteUser, getUserById } from "../../services/user";
import { getUserTenants } from "../../services/tenant";
import RedButton from "../buttons/red-button";
import BlackButton from "../buttons/black-button";

export default function UserModal({ user, close, onDeleted }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);
  const isAdmin = currentUser?.roles?.includes("Admin");
  const isCurrentUser = Number(currentUser?.id) === Number(user?.id);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [showDeleteError, setShowDeleteError] = useState(false);

  const { data: userDetail, isLoading: isLoadingUser } = useQuery({
    queryKey: ["getUserById", user?.id],
    queryFn: () => getUserById(user.id),
    enabled: !!user?.id,
  });

  const { data: tenants = [], isLoading: isLoadingTenants } = useQuery({
    queryKey: ["getUserTenants", user?.id],
    queryFn: () => getUserTenants(user?.id),
    enabled: !!user?.id,
  });

  const isLoading = isLoadingUser || isLoadingTenants;

  const deleteMutation = useMutation({
    mutationFn: () => deleteUser(user.id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      onDeleted();
    },
    onError: (error) => {
      setConfirmDelete(false);

      const data = error?.response?.data;
      const message =
        typeof data === "string"
          ? data
          : data?.message || data?.title || t("users.deleteError");

      setDeleteError(message);
      setShowDeleteError(true);
    },
  });

  return (
    <>
      {confirmDelete ? (
        <ConfirmModal
          title={t("users.deleteTitle")}
          message={t("users.deleteConfirmation")}
          confirmText={t("users.deleteAction")}
          cancelText={t("users.cancel")}
          onConfirm={() => deleteMutation.mutate()}
          close={() => setConfirmDelete(false)}
          isPending={deleteMutation.isPending}
        />
      ) : (
        <Modal open onClose={close}>
          <button
            onClick={close}
            className="absolute top-4 right-4 text-gray-500 hover:text-black transition duration-200 cursor-pointer"
          >
            <X size={20} />
          </button>

          {isLoading ? (
            <Loading />
          ) : (
            <>
              <h2 className="text-2xl font-semibold mb-2">
                {userDetail?.name} {userDetail?.surname}
              </h2>

              <p className="text-gray-600 mb-6">{userDetail?.email}</p>

              <div className="space-y-4 mb-8">
                <div className="bg-[#f4f0f5] rounded-lg border border-gray-400 shadow-md p-4">
                  <p className="text-sm text-gray-600 mb-1">Teléfono</p>
                  <p className="font-semibold text-[#333]">
                    {userDetail?.phoneNumber || "No proporcionado"}
                  </p>
                </div>
              </div>

              {tenants.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Negocios ({tenants.length})
                  </h3>
                  <div className="space-y-3">
                    {tenants.map((tenant) => (
                      <div
                        key={tenant.id}
                        className="border rounded-lg shadow-md border-gray-400 p-4 bg-[#f4f0f5]"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">{tenant.name}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              Rol:{" "}
                              <span className="font-semibold">
                                {tenant.role}
                              </span>
                            </p>
                          </div>
                          <span
                            className={`text-xs rounded-full px-2 py-1 ${
                              tenant.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {tenant.isActive ? "Activo" : "Inactivo"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tenants.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    Este usuario no pertenece a ningún negocio
                  </p>
                </div>
              )}

              {isAdmin && !isCurrentUser && (
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <RedButton
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    textSmall
                    text={t("users.deleteAction")}
                  />
                  <BlackButton
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    textSmall
                    text={t("users.suspendAction")}
                  />
                </div>
              )}
            </>
          )}
        </Modal>
      )}

      {showDeleteError && (
        <ErrorModal
          close={() => setShowDeleteError(false)}
          message={deleteError}
          isSuccesOrError
        />
      )}
    </>
  );
}
