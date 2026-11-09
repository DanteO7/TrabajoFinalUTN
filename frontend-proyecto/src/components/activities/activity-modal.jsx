import { X, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Modal from "../modals/modal";
import { updateActivity, deleteActivity } from "../../services/activity";
import SuccessModal from "../modals/success-modal";
import ErrorModal from "../modals/error-modal";
import ConfirmModal from "../modals/confirm-modal";
import { useHasPermission } from "../../store/tenant-store";
import WhiteButton from "../buttons/white-button";
import BlackButton from "../buttons/black-button";
import RedButton from "../buttons/red-button";
import { updateActivitySchema } from "../../schema/activity-schema";
import FormInput from "../inputs/form-input";
import { useTranslation } from "react-i18next";

export default function ActivityModal({ activity, tenantId, close }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const canUpdateActivity = useHasPermission(tenantId, "ACTIVITY_UPDATE");
  const canDeleteActivity = useHasPermission(tenantId, "ACTIVITY_DELETE");

  const [editing, setEditing] = useState(false);
  const [currentActivity, setCurrentActivity] = useState(activity);

  const [backendError, setBackendError] = useState();
  const [errorModal, setErrorModal] = useState(false);

  const [successMessage, setSuccessMessage] = useState();
  const [successModal, setSuccessModal] = useState(false);

  const [confirmModal, setConfirmModal] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(updateActivitySchema),
    defaultValues: {
      name: activity.name || "",
      description: activity.description || "",
    },
    mode: "onTouched",
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteActivity(currentActivity.id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["getActivities", tenantId],
      });

      queryClient.invalidateQueries({
        queryKey: ["getClasses", tenantId],
      });

      setConfirmModal(false);

      setSuccessMessage(t("activities.deleted"));
      setSuccessModal(true);

      setTimeout(() => {
        close();
      }, 2000);
    },

    onError: (error) => {
      const data = error?.response?.data;

      let msg = t("activities.deleteError");

      if (typeof data === "string") {
        msg = data;
      } else if (data?.errors) {
        msg = Object.values(data.errors).flat().join(" - ");
      } else if (data?.message) {
        msg = data.message;
      }

      setConfirmModal(false);
      setBackendError(msg);
      setErrorModal(true);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) =>
      updateActivity(currentActivity.id, {
        name: data.name,
        description: data.description,
      }),

    onSuccess: (updatedActivity) => {
      queryClient.invalidateQueries({
        queryKey: ["getActivities", tenantId],
      });

      queryClient.invalidateQueries({
        queryKey: ["getClasses", tenantId],
      });

      setCurrentActivity(updatedActivity);

      reset({
        name: updatedActivity.name || "",
        description: updatedActivity.description || "",
      });

      setEditing(false);

      setSuccessMessage(t("activities.updated"));
      setSuccessModal(true);

      setTimeout(() => {
        setSuccessModal(false);
      }, 2000);
    },

    onError: (error) => {
      const data = error?.response?.data;

      let msg = t("activities.updateError");

      if (typeof data === "string") {
        msg = data;
      } else if (data?.errors) {
        msg = Object.values(data.errors).flat().join(" - ");
      } else if (data?.message) {
        msg = data.message;
      }

      setBackendError(msg);
      setErrorModal(true);
    },
  });

  const handleUpdate = (data) => {
    updateMutation.mutate(data);
  };

  const handleCancelEdit = () => {
    setEditing(false);

    reset({
      name: currentActivity.name || "",
      description: currentActivity.description || "",
    });
  };

  return (
    <Modal open onClose={close}>
      <button
        onClick={close}
        className="absolute top-4 right-4 text-gray-500 hover:text-black transition duration-200 cursor-pointer"
      >
        <X size={20} />
      </button>

      {!editing ? (
        <>
          <h2 className="text-2xl font-semibold mb-2">
            {currentActivity.name}
          </h2>

          <p className="text-gray-600 whitespace-pre-wrap">
            {currentActivity.description || t("activities.noDescription")}
          </p>

          {(canUpdateActivity || canDeleteActivity) && (
            <div
              className={`grid ${canUpdateActivity && canDeleteActivity ? "grid-cols-2" : "grid-cols-1"} gap-3 mt-4`}
            >
              {canDeleteActivity && (
                <RedButton
                  text={t("common.delete")}
                  disabled={deleteMutation.isPending}
                  onClick={() => setConfirmModal(true)}
                  textSmall={true}
                  img={<Trash2 size={18} />}
                />
              )}

              {canUpdateActivity && (
                <BlackButton
                  text={t("common.edit")}
                  onClick={() => setEditing(true)}
                  textSmall={true}
                  img={<Pencil size={18} />}
                />
              )}
            </div>
          )}
        </>
      ) : (
        <form onSubmit={handleSubmit(handleUpdate)} className="space-y-6">
          <h2 className="text-2xl font-semibold text-center">
            {t("activities.editTitle")}
          </h2>

          <FormInput
            label={t("activities.name")}
            id="name"
            placeholder={t("activities.example")}
            register={register("name")}
            error={errors.name}
          />
          <FormInput
            textarea
            label={t("activities.descriptionOptional")}
            register={register("description")}
            error={errors.description}
            placeholder={t("activities.descriptionPlaceholder")}
          />

          <div className="grid grid-cols-2 gap-3">
            <WhiteButton
              text={t("common.cancel")}
              onClick={handleCancelEdit}
              textSmall={true}
            />

            <BlackButton
              text={updateMutation.isPending ? t("activities.updating") : t("common.update")}
              type="submit"
              disabled={updateMutation.isPending}
              textSmall={true}
            />
          </div>
        </form>
      )}

      {confirmModal && (
        <ConfirmModal
          title={t("activities.deleteTitle")}
          message={t("activities.deleteMessage", { name: currentActivity.name })}
          onConfirm={() => deleteMutation.mutate()}
          close={() => setConfirmModal(false)}
          isPending={deleteMutation.isPending}
        />
      )}

      {errorModal && (
        <ErrorModal
          close={() => setErrorModal(false)}
          message={backendError}
          isSuccesOrError={true}
        />
      )}

      {successModal && (
        <SuccessModal
          close={() => setSuccessModal(false)}
          message={successMessage}
          isSuccesOrError={true}
        />
      )}
    </Modal>
  );
}
