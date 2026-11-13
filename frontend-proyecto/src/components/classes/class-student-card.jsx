import { Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ClassStudentCard({
  student,
  onDelete,
  isPending,
  isTemplate = false,
}) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-between bg-[#f4f0f5] rounded-lg border border-gray-400 p-4">
      <div>
        <p className="font-semibold text-[#333]">
          {isTemplate
            ? `${student.studentName} ${student.studentSurname}`
            : `${student.name} ${student.surname}`}
        </p>

        {!isTemplate && (
          <p className="text-[13px] text-gray-500">{student.email}</p>
        )}
      </div>

      <button
        onClick={onDelete}
        disabled={isPending}
        aria-label={t("classStudentsModal.removeStudent")}
        className="text-red-600 hover:text-red-800 transition cursor-pointer disabled:opacity-50"
      >
        <Trash2 size={20} />
      </button>
    </div>
  );
}
