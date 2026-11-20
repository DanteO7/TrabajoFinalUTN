import { X, Pencil, Plus } from "lucide-react";
import { useState } from "react";
import {
  formatCurrency,
  formatNumber,
  getLocale,
} from "../../utils/formatting";
import Modal from "../modals/modal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getStudentPlans } from "../../services/student-plan";
import SuccessModal from "../modals/success-modal";
import ErrorModal from "../modals/error-modal";
import {
  assignAdditionalClasses,
  deleteStudent,
  updateStudent,
} from "../../services/student";
import ConfirmModal from "../modals/confirm-modal";
import BlackButton from "../buttons/black-button";
import RedButton from "../buttons/red-button";
import { Trash2 } from "lucide-react";
import WhiteButton from "../buttons/white-button";
import { useTranslation } from "react-i18next";
import { useHasPermission } from "../../store/tenant-store";

export default function StudentModal({ student, tenantId, close }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const [editing, setEditing] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(student);
  const [selectedStatus, setSelectedStatus] = useState(
    currentStudent.monthlyFeeStatus,
  );
  const [selectedPlan, setSelectedPlan] = useState(
    currentStudent.studentPlanId,
  );

  const [backendError, setBackendError] = useState();
  const [errorModal, setErrorModal] = useState(false);

  const [successMessage, setSuccessMessage] = useState();
  const [successModal, setSuccessModal] = useState(false);

  const [confirmModal, setConfirmModal] = useState(false);
  const [assignClassesModal, setAssignClassesModal] = useState(false);
  const [additionalClassesQuantity, setAdditionalClassesQuantity] =
    useState("");
  const canUpdateStudents = useHasPermission(tenantId, "STUDENT_UPDATE");

  const { data: plans = [] } = useQuery({
    queryKey: ["getStudentPlans", tenantId],
    queryFn: () => getStudentPlans(tenantId),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteStudent(currentStudent.id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["getStudents", tenantId],
      });
      setConfirmModal(false);

      setSuccessMessage(t("studentModal.deleteSuccess"));
      setSuccessModal(true);

      setTimeout(() => {
        close();
      }, 2000);
    },

    onError: (error) => {
      setConfirmModal(false);

      const data = error?.response?.data;

      let msg = t("studentModal.deleteError");

      if (typeof data === "string") msg = data;
      else if (data?.errors)
        msg = Object.values(data.errors).flat().join(" - ");
      else if (data?.message) msg = data.message;

      setBackendError(msg);
      setErrorModal(true);
    },
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      updateStudent(currentStudent.id, {
        studentPlanId: selectedPlan,
        monthlyFeeStatus: selectedStatus,
      }),

    onSuccess: (updatedStudent) => {
      queryClient.invalidateQueries({
        queryKey: ["getStudents", tenantId],
      });

      setSuccessMessage(t("studentModal.updateSuccess"));
      setSuccessModal(true);
      setEditing(false);
      setCurrentStudent(updatedStudent);

      setTimeout(() => {
        setSuccessModal(false);
      }, 2000);
    },

    onError: (error) => {
      const data = error?.response?.data;

      let msg = t("studentModal.updateError");

      if (typeof data === "string") msg = data;
      else if (data?.errors)
        msg = Object.values(data.errors).flat().join(" - ");
      else if (data?.message) msg = data.message;

      setBackendError(msg);
      setErrorModal(true);
      setSelectedStatus(currentStudent.monthlyFeeStatus);
    },
  });

  const assignClassesMutation = useMutation({
    mutationFn: () =>
      assignAdditionalClasses(
        currentStudent.id,
        Number(additionalClassesQuantity),
      ),

    onSuccess: (updatedStudent) => {
      queryClient.invalidateQueries({
        queryKey: ["getStudents", tenantId],
      });
      setCurrentStudent(updatedStudent);
      setAdditionalClassesQuantity("");
      setAssignClassesModal(false);
      setSuccessMessage(t("studentModal.assignClassesSuccess"));
      setSuccessModal(true);

      setTimeout(() => {
        setSuccessModal(false);
      }, 2000);
    },

    onError: (error) => {
      const data = error?.response?.data;

      let msg = t("studentModal.assignClassesError");

      if (typeof data === "string") msg = data;
      else if (data?.errors)
        msg = Object.values(data.errors).flat().join(" - ");
      else if (data?.message) msg = data.message;

      setBackendError(msg);
      setErrorModal(true);
    },
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Overdue":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "Paid":
        return t("tenantPaymentCard.paid");
      case "Pending":
        return t("tenantPaymentCard.pending");
      case "Overdue":
        return t("tenantPaymentCard.overdue");
      default:
        return status;
    }
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
            {currentStudent.name} {currentStudent.surname}
          </h2>
          <p className="text-gray-600 mb-6">{currentStudent.user?.email}</p>

          <div className="space-y-4 mb-8">
            {currentStudent.user?.email && (
              <div className="bg-[#f4f0f5] rounded-lg border border-gray-400 shadow-md p-4">
                <p className="text-sm text-gray-600 mb-1">
                  {t("studentModal.email")}
                </p>
                <p className="font-semibold text-[#333] text-[14px]">
                  {currentStudent.user?.email}
                </p>
              </div>
            )}

            {currentStudent.user?.phoneNumber && (
              <div className="bg-[#f4f0f5] rounded-lg border border-gray-400 shadow-md p-4">
                <p className="text-sm text-gray-600 mb-1">
                  {t("profile.phone")}
                </p>
                <p className="font-semibold text-[#333]">
                  {currentStudent.user?.phoneNumber}
                </p>
              </div>
            )}

            {(currentStudent.user?.weight || currentStudent.user?.age) && (
              <div className="flex gap-4">
                {currentStudent.user?.age && (
                  <div className="bg-[#f4f0f5] rounded-lg border border-gray-400 shadow-md p-4 w-full">
                    <p className="text-sm text-gray-600 mb-1">
                      {t("profile.age")}
                    </p>
                    <p className="font-semibold text-[#333]">
                      {t("studentModal.ageYears", {
                        age: formatNumber(currentStudent.user?.age),
                      })}
                    </p>
                  </div>
                )}
                {currentStudent.user?.weight && (
                  <div className="bg-[#f4f0f5] rounded-lg border border-gray-400 shadow-md p-4 w-full">
                    <p className="text-sm text-gray-600 mb-1">
                      {t("profile.weight")}
                    </p>
                    <p className="font-semibold text-[#333]">
                      {t("studentModal.weightKg", {
                        weight: formatNumber(currentStudent.user?.weight),
                      })}
                    </p>
                  </div>
                )}
              </div>
            )}
            {currentStudent.user?.pathologies && (
              <div className="bg-[#f4f0f5] rounded-lg border border-gray-400 shadow-md p-4">
                <p className="text-sm text-gray-600 mb-1">
                  {t("profile.pathologies")}
                </p>
                <p className="font-semibold text-[#333]">
                  {currentStudent.user?.pathologies}
                </p>
              </div>
            )}
            <div className="bg-[#f4f0f5] rounded-lg border border-gray-400 shadow-md p-4">
              <p className="text-sm text-gray-600 mb-1">
                {t("studentModal.plan")}
              </p>
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-[#333]">
                    {currentStudent.studentPlan.name}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {t("studentModal.classesPerMonth", {
                      count: formatNumber(
                        currentStudent.studentPlan.classesPerMonth,
                      ),
                    })}
                  </p>
                </div>
                <p className="font-bold text-[#333]">
                  {formatCurrency(currentStudent.studentPlan.price)}
                </p>
              </div>
            </div>

            <div className="bg-[#f4f0f5] rounded-lg border border-gray-400 shadow-md p-4">
              <p className="text-sm text-gray-600 mb-1">
                {t("studentModal.availableClasses")}
              </p>
              <p className="font-semibold text-[#333]">
                {formatNumber(
                  currentStudent.remainingClasses ??
                    currentStudent.studentPlan.classesPerMonth,
                )}
              </p>
              {(currentStudent.additionalClasses ?? 0) > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  {t("studentModal.additionalClasses", {
                    count: formatNumber(currentStudent.additionalClasses),
                  })}
                </p>
              )}
            </div>

            <div className="bg-[#f4f0f5] rounded-lg border border-gray-400 shadow-md p-4">
              <p className="text-sm text-gray-600 mb-2">
                {t("studentModal.feeStatus")}
              </p>
              <span
                className={`inline-block text-sm font-medium rounded-full px-3 py-1 ${getStatusColor(
                  currentStudent.monthlyFeeStatus,
                )}`}
              >
                {getStatusLabel(currentStudent.monthlyFeeStatus)}
              </span>
            </div>
            <div className="bg-[#f4f0f5] rounded-lg border border-gray-400 shadow-md p-4">
              <p className="text-sm text-gray-600 mb-1">
                {t("studentModal.dueDate")}
              </p>
              <p className="font-semibold text-[#333]">
                {currentStudent.paymentDueDate
                  ? new Date(currentStudent.paymentDueDate).toLocaleDateString(
                      getLocale(),
                    )
                  : t("studentModal.noDate")}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 w-full">
            {canUpdateStudents && (
              <BlackButton
                text={t("studentModal.assignClasses")}
                img={<Plus size={18} />}
                onClick={() => setAssignClassesModal(true)}
                textSmall={true}
              />
            )}
            <div className="grid grid-cols-2 gap-3 max-[360px]:text-[13px] w-full">
              <RedButton
                text={t("studentModal.delete")}
                img={<Trash2 size={18} />}
                onClick={() => setConfirmModal(true)}
                textSmall={true}
              />

              <BlackButton
                text={t("studentModal.edit")}
                img={<Pencil size={18} />}
                onClick={() => setEditing(true)}
                textSmall={true}
              />
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-center">
            {t("studentModal.editTitle")}
          </h2>

          <div>
            <label className="block text-sm font-semibold mb-3">
              {t("studentModal.changePlan")}
            </label>

            <select
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(parseInt(e.target.value))}
              className="rounded-lg w-full px-3 py-2 text-gray-600 cursor-pointer bg-[#f1eef3] border border-gray-400 outline-none focus:ring-[1.5px] focus:border-transparent transition-[border-color,box-shadow] duration-200"
            >
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} - {formatCurrency(plan.price)} (
                  {t("studentModal.classesPerMonth", {
                    count: formatNumber(plan.classesPerMonth),
                  })}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3">
            <WhiteButton
              text={t("studentModal.cancel")}
              onClick={() => {
                setEditing(false);
                setSelectedStatus(currentStudent.monthlyFeeStatus);
                setSelectedPlan(currentStudent.studentPlanId);
              }}
              textSmall={true}
            />
            <BlackButton
              text={
                updateMutation.isPending
                  ? t("studentModal.updating")
                  : t("studentModal.update")
              }
              onClick={() => updateMutation.mutate()}
              textSmall={true}
            />
          </div>
        </div>
      )}
      {assignClassesModal && (
        <Modal open onClose={() => setAssignClassesModal(false)}>
          <h2 className="text-xl font-semibold mb-2">
            {t("studentModal.assignClassesTitle")}
          </h2>
          <p className="text-sm text-gray-600 mb-5">
            {t("studentModal.assignClassesDescription")}
          </p>

          <label className="block text-sm font-semibold mb-2">
            {t("studentModal.additionalQuantity")}
          </label>
          <input
            type="number"
            min={1}
            max={99}
            step={1}
            value={additionalClassesQuantity}
            onChange={(event) => {
              const value = event.target.value;
              if (
                value === "" ||
                (/^\d+$/.test(value) &&
                  Number(value) >= 1 &&
                  Number(value) <= 99)
              ) {
                setAdditionalClassesQuantity(value);
              }
            }}
            placeholder={t("studentModal.quantityPlaceholder")}
            className="rounded-lg w-full px-3 py-2 text-gray-600 bg-[#f1eef3] border border-gray-400 outline-none focus:ring-[1.5px] focus:border-transparent transition-[border-color,box-shadow] duration-200"
          />

          <div className="flex justify-end gap-3 mt-6">
            <WhiteButton
              text={t("studentModal.cancel")}
              onClick={() => {
                setAssignClassesModal(false);
                setAdditionalClassesQuantity("");
              }}
              textSmall={true}
            />
            <BlackButton
              text={
                assignClassesMutation.isPending
                  ? t("studentModal.assigningClasses")
                  : t("studentModal.assignClassesConfirm")
              }
              disabled={
                assignClassesMutation.isPending ||
                !/^\d+$/.test(additionalClassesQuantity) ||
                Number(additionalClassesQuantity) < 1 ||
                Number(additionalClassesQuantity) > 99
              }
              onClick={() => assignClassesMutation.mutate()}
              textSmall={true}
            />
          </div>
        </Modal>
      )}
      {confirmModal && (
        <ConfirmModal
          title={t("studentModal.confirmTitle")}
          message={t("studentModal.confirmMessage", {
            name: `${currentStudent.name} ${currentStudent.surname}`,
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
