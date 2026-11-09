import { X, Pencil, Trash2, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import Modal from "../modals/modal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { updateProfessor, deleteProfessor } from "../../services/professor";
import { getSpecialities } from "../../services/speciality";
import SuccessModal from "../modals/success-modal";
import ErrorModal from "../modals/error-modal";
import { useHasPermission } from "../../store/tenant-store";
import ConfirmModal from "../modals/confirm-modal";
import RedButton from "../buttons/red-button";
import BlackButton from "../buttons/black-button";
import WhiteButton from "../buttons/white-button";
import { useTranslation } from "react-i18next";
import { formatNumber } from "../../utils/formatting";

export default function ProfessorModal({
  professor,
  tenantId,
  close,
  onUpdated,
}) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const canUpdateProfessor = useHasPermission(tenantId, "PROFESSOR_UPDATE");
  const canDeleteProfessor = useHasPermission(tenantId, "PROFESSOR_DELETE");

  const [editing, setEditing] = useState(false);
  const [currentProfessor, setCurrentProfessor] = useState(professor);
  const [isActive, setIsActive] = useState(professor.isActive);
  const [selectedSpecialityIds, setSelectedSpecialityIds] = useState(() =>
    professor.specialities.map((spec) => spec.specialityId),
  );
  const selectedSpecialityIdSet = useMemo(
    () => new Set(selectedSpecialityIds),
    [selectedSpecialityIds],
  );
  const [openSpecialityModal, setOpenSpecialityModal] = useState(false);
  const [backendError, setBackendError] = useState();
  const [errorModal, setErrorModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState();
  const [successModal, setSuccessModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);

  const { data: specialities = [] } = useQuery({
    queryKey: ["getSpecialities", tenantId],
    queryFn: () => getSpecialities(tenantId),
  });

  const startEditing = () => {
    setIsActive(currentProfessor.isActive);

    setSelectedSpecialityIds(
      currentProfessor.specialities.map((spec) => spec.specialityId),
    );

    setEditing(true);
  };

  const availableSpecialities = specialities.filter(
    (speciality) => !selectedSpecialityIdSet.has(speciality.id),
  );

  const addSpeciality = (specialityId) => {
    setSelectedSpecialityIds((prev) => {
      if (prev.includes(specialityId)) {
        return prev;
      }

      return [...prev, specialityId];
    });
  };

  const removeSpeciality = (specialityId) => {
    setSelectedSpecialityIds((prev) =>
      prev.filter((id) => id !== specialityId),
    );
  };

  const deleteMutation = useMutation({
    mutationFn: () => deleteProfessor(currentProfessor.id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["getProfessors", tenantId],
      });

      setConfirmModal(false);
      setSuccessMessage(t("professorModal.deleteSuccess"));
      setSuccessModal(true);

      setTimeout(() => {
        close();
      }, 2000);
    },

    onError: (error) => {
      const data = error?.response?.data;

      let msg = t("professorModal.deleteError");

      if (typeof data === "string") msg = data;
      else if (data?.errors)
        msg = Object.values(data.errors).flat().join(" - ");
      else if (data?.message) msg = data.message;

      setConfirmModal(false);
      setBackendError(msg);
      setErrorModal(true);
    },
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      updateProfessor(currentProfessor.id, {
        isActive,
        specialityIds: selectedSpecialityIds,
      }),

    onSuccess: async (updatedProfessor) => {
      await queryClient.invalidateQueries({
        queryKey: ["getProfessors", tenantId],
      });

      onUpdated?.(updatedProfessor);
      setCurrentProfessor(updatedProfessor);
      setIsActive(updatedProfessor.isActive);

      setSelectedSpecialityIds(
        updatedProfessor.specialities.map((spec) => spec.specialityId),
      );

      setEditing(false);
      setSuccessMessage(t("professorModal.updateSuccess"));
      setSuccessModal(true);

      setTimeout(() => {
        setSuccessModal(false);
      }, 2000);
    },

    onError: (error) => {
      const data = error?.response?.data;

      let msg = t("professorModal.updateError");

      if (typeof data === "string") msg = data;
      else if (data?.errors)
        msg = Object.values(data.errors).flat().join(" - ");
      else if (data?.message) msg = data.message;

      setBackendError(msg);
      setErrorModal(true);

      setIsActive(currentProfessor.isActive);

      setSelectedSpecialityIds(
        currentProfessor.specialities.map((spec) => spec.specialityId),
      );
    },
  });

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
            {currentProfessor.user.name} {currentProfessor.user.surname}
          </h2>
          <p className="text-gray-600 mb-6 text-[15px]">
            {currentProfessor.user.email}
          </p>
          <div className="space-y-4">
            {currentProfessor.user.phoneNumber && (
              <div className="bg-[#f4f0f5] rounded-lg border border-gray-400 shadow-md p-4">
                <p className="text-sm text-gray-600 mb-1">
                  {t("professorModal.phone")}
                </p>

                <p className="font-semibold text-[#333]">
                  {currentProfessor.user.phoneNumber}
                </p>
              </div>
            )}

            {(currentProfessor.user.weight || currentProfessor.user.age) && (
              <div className="flex gap-4">
                {currentProfessor.user.age && (
                  <div className="bg-[#f4f0f5] w-full rounded-lg border border-gray-400 shadow-md p-4">
                    <p className="text-sm text-gray-600 mb-1">
                      {t("professorModal.age")}
                    </p>

                    <p className="font-semibold text-[#333]">
                      {t("professorModal.ageYears", {
                        age: formatNumber(currentProfessor.user.age),
                      })}
                    </p>
                  </div>
                )}

                {currentProfessor.user.weight && (
                  <div className="bg-[#f4f0f5] w-full rounded-lg border border-gray-400 shadow-md p-4">
                    <p className="text-sm text-gray-600 mb-1">
                      {t("professorModal.weight")}
                    </p>

                    <p className="font-semibold text-[#333]">
                      {t("professorModal.weightKg", {
                        weight: formatNumber(currentProfessor.user.weight),
                      })}
                    </p>
                  </div>
                )}
              </div>
            )}
            {currentProfessor.user.pathologies && (
              <div className="bg-[#f4f0f5] rounded-lg border border-gray-400 shadow-md p-4">
                <p className="text-sm text-gray-600 mb-1">
                  {t("professorModal.pathologies")}
                </p>
                <p className="font-semibold text-[#333]">
                  {currentProfessor.user.pathologies}
                </p>
              </div>
            )}
            <div className="bg-[#f4f0f5] rounded-lg border border-gray-400 shadow-md p-4">
              <p className="text-sm text-gray-600 mb-2">
                {t("professorModal.status")}
              </p>

              <span
                className={`inline-block text-sm font-medium rounded-full px-3 py-1 ${
                  currentProfessor.isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {currentProfessor.isActive
                  ? t("professorModal.active")
                  : t("professorModal.inactive")}
              </span>
            </div>

            {currentProfessor.specialities.length > 0 && (
              <div className="bg-[#f4f0f5] rounded-lg border border-gray-400 shadow-md p-4">
                <p className="text-sm text-gray-600 mb-3">
                  {t("professorModal.professions")}
                </p>

                <div className="flex flex-wrap gap-2">
                  {currentProfessor.specialities.map((spec) => (
                    <span
                      key={spec.specialityId}
                      className="bg-[#333] text-white text-sm rounded-full px-3 py-1"
                    >
                      {spec.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          {(canUpdateProfessor || canDeleteProfessor) && (
            <div className="flex gap-2 mt-8">
              {canDeleteProfessor && (
                <RedButton
                  text={t("professorModal.delete")}
                  disabled={deleteMutation.isPending}
                  onClick={() => setConfirmModal(true)}
                  textSmall={true}
                  img={<Trash2 size={18} />}
                />
              )}

              {canUpdateProfessor && (
                <BlackButton
                  text={t("professorModal.edit")}
                  onClick={startEditing}
                  textSmall={true}
                  img={<Pencil size={18} />}
                />
              )}
            </div>
          )}
        </>
      ) : (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-center">
            {t("professorModal.editTitle")}
          </h2>

          <div>
            <label className="block text-sm font-semibold mb-3">
              {t("professorModal.status")}
            </label>

            <div className="space-y-2">
              {[true, false].map((status) => (
                <div
                  key={status.toString()}
                  onClick={() => setIsActive(status)}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition ${
                    isActive === status
                      ? "border-black border-2 bg-[#F4F0F5]"
                      : "border-gray-300 hover:border-gray-600"
                  }`}
                >
                  <p className="font-semibold text-[#333]">
                    {status
                      ? t("professorModal.active")
                      : t("professorModal.inactive")}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-3">
              {t("professorModal.professions")}
            </label>

            {selectedSpecialityIds.length > 0 ? (
              <div className="bg-[#f4f0f5] rounded-lg border border-gray-400 shadow-md p-4 mb-4">
                <div className="flex flex-wrap gap-2">
                  {selectedSpecialityIds.map((specialityId) => {
                    const speciality = specialities.find(
                      (s) => s.id === specialityId,
                    );

                    if (!speciality) return null;

                    return (
                      <span
                        key={specialityId}
                        className="bg-[#333] text-white text-sm rounded-full px-3 py-1 flex items-center gap-2"
                      >
                        {speciality.name}

                        <button
                          type="button"
                          onClick={() => removeSpeciality(specialityId)}
                          className="hover:text-red-300 transition cursor-pointer"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 mb-4">
                {t("professorModal.noProfessions")}
              </p>
            )}

            <BlackButton
              text={t("professorModal.addProfessions")}
              textSmall={true}
              img={<Plus size={18} />}
              onClick={() => setOpenSpecialityModal(true)}
              disabled={availableSpecialities.length === 0}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <WhiteButton
              text={t("professorModal.cancel")}
              onClick={() => {
                setEditing(false);
                setIsActive(currentProfessor.isActive);
                setSelectedSpecialityIds(
                  currentProfessor.specialities.map(
                    (spec) => spec.specialityId,
                  ),
                );
              }}
              textSmall={true}
            />

            <BlackButton
              text={
                updateMutation.isPending
                  ? t("professorModal.updating")
                  : t("professorModal.update")
              }
              onClick={() => updateMutation.mutate()}
              disabled={updateMutation.isPending}
              textSmall={true}
            />
          </div>
        </div>
      )}

      {openSpecialityModal && (
        <Modal open onClose={() => setOpenSpecialityModal(false)}>
          <h2 className="text-2xl font-semibold mb-5">
            {t("professorModal.addProfessions")}
          </h2>

          {availableSpecialities.length > 0 ? (
            <div className="space-y-2">
              {availableSpecialities.map((speciality) => (
                <button
                  key={speciality.id}
                  type="button"
                  onClick={() => {
                    addSpeciality(speciality.id);
                    setOpenSpecialityModal(false);
                  }}
                  className="w-full text-left p-3 rounded-lg border border-gray-400  hover:border-[#333] hover:bg-[#F4F0F5] shadow-md transition cursor-pointer"
                >
                  <p className="font-semibold">{speciality.name}</p>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">
              {t("professorModal.noProfessionsAvailable")}
            </p>
          )}
        </Modal>
      )}

      {confirmModal && (
        <ConfirmModal
          title={t("professorModal.confirmTitle")}
          message={t("professorModal.confirmMessage", {
            name: `${currentProfessor.user.name} ${currentProfessor.user.surname}`,
          })}
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
