import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { X, Check } from "lucide-react";
import Modal from "../modals/modal";
import { getPendingPaymentStudents } from "../../services/student";
import { getPendingPaymentTenants } from "../../services/tenant";
import WhiteButton from "../buttons/white-button";
import BlackButton from "../buttons/black-button";
import SearchInput from "../inputs/search-input";
import { useTranslation } from "react-i18next";

export default function SelectStudentPaymentModal({
  tenantId,
  close,
  onSelect,
  isAdmin = false,
  demoMode = false,
}) {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState("");
  const [selected, setSelected] = useState(null);

  const { data: students = [], isLoading: isLoadingStudents } = useQuery({
    queryKey: ["pendingPaymentStudents", tenantId],
    queryFn: () => getPendingPaymentStudents(tenantId),
    enabled: !demoMode && !isAdmin && !!tenantId,
  });
  console.log(students);

  const { data: tenants = [], isLoading: isLoadingTenants } = useQuery({
    queryKey: ["pendingPaymentTenants"],
    queryFn: getPendingPaymentTenants,
    enabled: !demoMode && isAdmin,
  });

  const demoStudent = {
    id: "demo-student",
    userId: "demo-user",
    tenantId,
    studentPlanId: "demo-plan",
    user: {
      name: t("paymentForm.demoStudent"),
      surname: "",
      email: "alumno.demo@turnofacil.local",
    },
    studentPlan: {
      name: t("paymentForm.demoPlan"),
      price: 18000,
    },
  };
  const items = demoMode ? [demoStudent] : isAdmin ? tenants : students;

  const filteredItems = items.filter((item) => {
    const text = isAdmin
      ? item.name || ""
      : `${item.name || item.user?.name || ""} ${
          item.surname || item.user?.surname || ""
        } ${item.user?.email || ""}`;

    return text.toLowerCase().includes(inputValue.toLowerCase());
  });

  const isLoading = isAdmin ? isLoadingTenants : isLoadingStudents;

  const getName = (item) => {
    if (isAdmin) {
      return item.name;
    }

    const name = item.name || item.user?.name || "";
    const surname = item.surname || item.user?.surname || "";

    return `${name} ${surname}`.trim();
  };

  const getSecondaryText = (item) => {
    if (isAdmin) {
      return item.ownerUser?.name + " " + item.ownerUser?.surname;
    }

    return item.user?.email || "";
  };

  const handleSelect = () => {
    if (!selected) return;

    onSelect(selected);

    close();
  };

  return (
    <Modal open={true} onClose={close}>
      <button
        onClick={close}
        aria-label={t("common.close")}
        className="absolute top-4 right-4 text-gray-500 hover:text-black cursor-pointer"
      >
        <X size={20} />
      </button>

      <h2 className="text-2xl font-semibold mb-4">
        {isAdmin
          ? t("selectPaymentRecipient.selectBusiness")
          : t("selectPaymentRecipient.selectStudent")}
      </h2>

      <SearchInput
        value={inputValue}
        onChange={setInputValue}
        placeholder={t("selectPaymentRecipient.search")}
      />

      <div className="max-h-96 overflow-y-auto space-y-2 mt-4">
        {isLoading ? (
          <p className="text-gray-500 text-center py-4">
            {t("selectPaymentRecipient.loading")}
          </p>
        ) : filteredItems.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            {isAdmin
              ? t("selectPaymentRecipient.noBusinesses")
              : t("selectPaymentRecipient.noStudents")}
          </p>
        ) : (
          filteredItems.map((item) => {
            const isSelected = selected?.id === item.id;

            return (
              <div
                key={item.id}
                onClick={() => setSelected(item)}
                className={`border rounded-lg border-gray-400 p-3 cursor-pointer bg-[#F1EEF3] transition ${
                  isSelected
                    ? "bg-red-100 border-red-400"
                    : "hover:bg-[#F1EEF3]"
                }`}
              >
                <div className="flex justify-between gap-3 items-center px-1">
                  <div>
                    <p className="font-semibold">{getName(item)}</p>

                    <p className="text-sm text-gray-600">
                      {getSecondaryText(item)}
                    </p>
                  </div>
                  <div className="mt-1 w-5 flex justify-center items-center">
                    {isSelected && <Check size={20} color="#FC697B" />}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mt-8">
        <WhiteButton
          type="button"
          text={t("selectPaymentRecipient.cancel")}
          onClick={close}
          textSmall={true}
        />

        <BlackButton
          type="button"
          text={t("selectPaymentRecipient.select")}
          textSmall={true}
          onClick={handleSelect}
          disabled={!selected}
        />
      </div>
    </Modal>
  );
}
