import { Trash2 } from "lucide-react";

export default function ClassStudentCard({ student, onDelete, isPending }) {
  return (
    <div className="flex items-center justify-between bg-[#efefef] rounded-xl p-4">
      <div>
        <p className="font-semibold text-[#333]">
          {student.name} {student.surname}
        </p>

        <p className="text-sm text-gray-500">{student.email}</p>
      </div>

      <button
        onClick={onDelete}
        disabled={isPending}
        className="text-red-600 hover:text-red-800 transition cursor-pointer disabled:opacity-50"
      >
        <Trash2 size={20} />
      </button>
    </div>
  );
}
