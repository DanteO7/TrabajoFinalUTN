import { X } from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import Modal from "../modals/modal";
import ErrorModal from "../modals/error-modal";
import {
  createInvitation,
  deleteInvitation,
  getInvitationByTenant,
} from "../../services/invitation";
import BlackButton from "../buttons/black-button";
import WhiteButton from "../buttons/white-button";
import RedButton from "../buttons/red-button";
import { Copy } from "lucide-react";
import { Check } from "lucide-react";
import FormInput from "../inputs/form-input";
import { useHasPermission } from "../../store/tenant-store";
import { getLocale } from "../../utils/formatting";
import { useTranslation } from "react-i18next";

export default function LinkModal({ tenantId, close, role, onCompleted }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const canCreateInvitations = useHasPermission(tenantId, "INVITATION_CREATE");
  const canDeleteInvitations = useHasPermission(tenantId, "INVITATION_DELETE");

  const [backendError, setBackendError] = useState();
  const [errorModal, setErrorModal] = useState(false);

  const [copied, setCopied] = useState(false);

  const copyPaymentData = async (value) => {
    try {
      await navigator.clipboard.writeText(value);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error(t("linkModal.copyError"), error);
    }
  };
  const { data: currentInvitation, isLoading } = useQuery({
    queryKey: ["invitation", tenantId, role],
    queryFn: () => getInvitationByTenant(tenantId, role),
    retry: false,
    refetchOnWindowFocus: false,
  });

  const mutation = useMutation({
    mutationFn: () =>
      createInvitation({
        tenantId,
        role,
      }),

    onSuccess: (data) => {
      queryClient.setQueryData(["invitation", tenantId, role], data);

      onCompleted?.();
    },

    onError: (error) => {
      const data = error?.response?.data;
      let msg = t("linkModal.createError");

      if (typeof data === "string") msg = data;
      else if (data?.errors)
        msg = Object.values(data.errors).flat().join(" - ");
      else if (data?.message) msg = data.message;

      setBackendError(msg);
      setErrorModal(true);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteInvitation(id),
    onSuccess: () => {
      queryClient.setQueryData(["invitation", tenantId, role], null);
    },
    onError: (error) => {
      const data = error?.response?.data;
      let msg = t("linkModal.deleteError");
      if (data?.message) msg = data.message;

      setBackendError(msg);
      setErrorModal(true);
    },
  });

  const isExpired =
    currentInvitation?.expirationDate &&
    new Date(currentInvitation.expirationDate) < new Date();

  const hasValidLink = currentInvitation && !isExpired;

  return (
    <Modal open onClose={close}>
      <button
        onClick={close}
        aria-label={t("common.close")}
        className="absolute top-4 right-4 text-gray-500 hover:text-black transition cursor-pointer"
      >
        <X size={20} />
      </button>

      <h2 className="text-2xl font-semibold text-center mb-6">
        {role.toLowerCase() === "student"
          ? t("linkModal.titleStudent")
          : t("linkModal.titleProfessor")}
      </h2>

      {isLoading ? (
        <p className="text-center text-gray-500">
          {t("linkModal.loading")}
        </p>
      ) : hasValidLink ? (
        <>
          <div className="border rounded-lg p-4 flex flex-col gap-3">
            <p className="font-semibold">{t("linkModal.active")}</p>

            <FormInput value={currentInvitation.link} />

            <BlackButton
              type="button"
              text={copied ? t("linkModal.copied") : t("linkModal.copy")}
              textSmall
              img={copied ? <Check size={16} /> : <Copy size={16} />}
              onClick={() => copyPaymentData(currentInvitation.link)}
              className="flex items-center gap-2 shrink-0 px-3 py-2 rounded-lg text-sm text-gray-600 hover:text-black hover:bg-white transition cursor-pointer"
            />

            <p className="text-sm text-gray-600">
              {t("linkModal.expires")}{" "}
              {new Date(currentInvitation.expirationDate).toLocaleDateString(
                getLocale(),
              )}
            </p>
          </div>

          {(canCreateInvitations || canDeleteInvitations) && (
            <div className="flex flex-col gap-2 mt-4">
              {canCreateInvitations && (
                <WhiteButton
                  disabled={mutation.isPending}
                  text={
                    mutation.isPending
                      ? t("linkModal.generating")
                      : t("linkModal.generate")
                  }
                  onClick={() => mutation.mutate()}
                  textSmall={true}
                />
              )}

              {hasValidLink && canDeleteInvitations && (
                <RedButton
                  text={
                    deleteMutation.isPending
                      ? t("linkModal.deleting")
                      : t("linkModal.delete")
                  }
                  disabled={deleteMutation.isPending}
                  onClick={() => deleteMutation.mutate(currentInvitation.id)}
                  textSmall={true}
                />
              )}
            </div>
          )}
        </>
      ) : (
        <>
          {isExpired && (
            <p className="text-center text-red-500 font-semibold mb-4">
              {t("linkModal.expired")}
            </p>
          )}

          <BlackButton
            disabled={mutation.isPending}
            text={
              mutation.isPending
                ? t("linkModal.generating")
                : t("linkModal.generate")
            }
            onClick={() => mutation.mutate()}
            textSmall={true}
          />
        </>
      )}

      {errorModal && (
        <ErrorModal
          close={() => setErrorModal(false)}
          message={backendError}
          isSuccesOrError
        />
      )}
    </Modal>
  );
}
