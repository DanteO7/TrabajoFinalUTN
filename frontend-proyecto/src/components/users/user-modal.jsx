import { X } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Modal from "../modals/modal";
import Loading from "../loading";
import ConfirmModal from "../modals/confirm-modal";
import ErrorModal from "../modals/error-modal";
import { useAuthStore } from "../../store/auth-store";
import {
  activateUser,
  deleteUser,
  getUserById,
  suspendUser,
} from "../../services/user";
import { getUserTenants } from "../../services/tenant";
import RedButton from "../buttons/red-button";
import SuccessModal from "../modals/success-modal";
import BlackButton from "../buttons/black-button";

export default function UserModal({ user, close, onDeleted }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);
  const isAdmin = currentUser?.roles?.includes("Admin");
  const isCurrentUser = Number(currentUser?.id) === Number(user?.id);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [statusAction, setStatusAction] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [showDeleteError, setShowDeleteError] = useState(false);
  const [statusError, setStatusError] = useState("");
  const [showStatusError, setShowStatusError] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [successModal, setSuccessModal] = useState(false);

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

  useEffect(() => {
    if (!successModal) return undefined;

    const timeoutId = setTimeout(() => {
      setSuccessModal(false);
      close();
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [close, successModal]);

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

  const statusMutation = useMutation({
    mutationFn: () =>
      statusAction === "activate"
        ? activateUser(user.id)
        : suspendUser(user.id),

    onSuccess: async () => {
      const action = statusAction;

      setStatusAction(null);
      queryClient.setQueryData(["getUserById", user.id], (currentUser) =>
        currentUser
          ? { ...currentUser, isActive: action === "activate" }
          : currentUser,
      );

      await queryClient.invalidateQueries({ queryKey: ["users"] });

      setSuccessMessage(
        t(
          action === "activate"
            ? "users.activateSuccess"
            : "users.suspendSuccess",
        ),
      );
      setSuccessModal(true);
    },

    onError: (error) => {
      const action = statusAction;
      setStatusAction(null);

      const data = error?.response?.data;
      const message =
        typeof data === "string"
          ? data
          : data?.message ||
            data?.title ||
            t(
              action === "activate"
                ? "users.activateError"
                : "users.suspendError",
            );

      setStatusError(message);
      setShowStatusError(true);
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
      ) : statusAction ? (
        <ConfirmModal
          title={t(
            statusAction === "activate"
              ? "users.activateTitle"
              : "users.suspendTitle",
          )}
          message={t(
            statusAction === "activate"
              ? "users.activateConfirmation"
              : "users.suspendConfirmation",
          )}
          confirmText={t(
            statusAction === "activate"
              ? "users.activateAccount"
              : "users.suspendAccount",
          )}
          cancelText={t("users.cancel")}
          onConfirm={() => statusMutation.mutate()}
          close={() => setStatusAction(null)}
          isPending={statusMutation.isPending}
          pendingText={t(
            statusAction === "activate"
              ? "users.activating"
              : "users.suspending",
          )}
        />
      ) : showStatusError ? (
        <ErrorModal
          close={() => {
            setShowStatusError(false);
            close();
          }}
          message={statusError}
          isSuccesOrError
        />
      ) : successModal ? null : (
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
              <p className="text-sm text-gray-600 mb-6">
                {t("users.accountStatus")}:{" "}
                <span className="font-semibold">
                  {userDetail?.isActive
                    ? t("users.active")
                    : t("users.suspended")}
                </span>
              </p>

              <div className="space-y-4 mb-8">
                <div className="bg-[#f4f0f5] rounded-lg border border-gray-400 shadow-md p-4">
                  <p className="text-sm text-gray-600 mb-1">
                    {t("users.phone")}
                  </p>
                  <p className="font-semibold text-[#333]">
                    {userDetail?.phoneNumber || t("users.notProvided")}
                  </p>
                </div>
              </div>

              {tenants.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    {t("users.businessesCount", { count: tenants.length })}
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
                              {t("users.role")}:{" "}
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
                            {tenant.isActive
                              ? t("tenants.active")
                              : t("tenants.inactive")}
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
                    {t("users.noBusinesses")}
                  </p>
                </div>
              )}

              {isAdmin && (
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {!isCurrentUser && (
                    <RedButton
                      type="button"
                      onClick={() => setConfirmDelete(true)}
                      textSmall
                      text={t("users.deleteAction")}
                    />
                  )}
                  {userDetail?.isActive === true && (
                    <BlackButton
                      type="button"
                      onClick={() => setStatusAction("suspend")}
                      textSmall
                      text={t("users.suspendAccount")}
                    />
                  )}
                  {userDetail?.isActive === false && (
                    <BlackButton
                      type="button"
                      onClick={() => setStatusAction("activate")}
                      textSmall
                      text={t("users.activateAccount")}
                    />
                  )}
                </div>
              )}
            </>
          )}
        </Modal>
      )}
      {successModal && (
        <SuccessModal
          close={() => {
            setSuccessModal(false);
            close();
          }}
          message={successMessage}
          isSuccesOrError={true}
        />
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
