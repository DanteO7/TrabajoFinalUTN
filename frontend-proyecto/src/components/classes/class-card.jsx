import { Check } from "lucide-react";

export default function ClassCard({
  classItem,
  onClick,
  isSelected = false,
  canSelect = false,
  onToggleSelection,
  onTouchStart,
  onTouchEnd,
  onTouchMove,
  onTouchCancel,
  onContextMenu,
}) {
  const isFull =
    classItem.reservationsCount != null &&
    classItem.reservationsCount === classItem.maxCapacity;

  const studentsCount =
    classItem.reservationsCount ?? classItem.students?.length ?? 0;

  return (
    <div
      onClick={onClick}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onTouchMove={onTouchMove}
      onTouchCancel={onTouchCancel}
      onContextMenu={onContextMenu}
      className={`relative cursor-pointer rounded-lg border p-5 shadow-md transition-all duration-300 ${
        isSelected
          ? "border-[#FC697B] bg-red-100"
          : isFull
            ? "border-gray-400 bg-red-100"
            : "border-gray-400 bg-[#F1EEF3] hover:bg-[#EFECF0]"
      }`}
    >
      <div className="grid grid-cols-2 items-center">
        <div className="flex items-center gap-5">
          {canSelect && (
            <button
              type="button"
              aria-label={
                isSelected ? "Deseleccionar clase" : "Seleccionar clase"
              }
              onClick={(event) => {
                event.stopPropagation();

                if (canSelect) {
                  onToggleSelection?.();
                }
              }}
              className={`hidden h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded border transition-all duration-200 min-[900px]:flex ${
                isSelected
                  ? "border-[#FC697B] bg-red-100 hover:border-[#e93146]"
                  : "border-gray-400 hover:border-gray-500"
              }`}
            >
              {isSelected && (
                <span className="text-xl text-[#FC697B]">
                  <Check />
                </span>
              )}
            </button>
          )}

          <div className="min-w-0">
            <h3 className="mb-1 text-xl font-semibold">
              {classItem.activityName}
            </h3>

            <p className="text-gray-500">
              {classItem.professor?.user?.name ?? classItem.professorName}{" "}
              {classItem.professor?.user?.surname ?? classItem.professorSurname}
            </p>
          </div>
        </div>

        <div className="text-right">
          <p className="font-semibold">
            {classItem.startTime.slice(0, 5)} - {classItem.endTime.slice(0, 5)}
          </p>

          <p className="mt-1 text-gray-500">
            {studentsCount}/{classItem.maxCapacity} alumnos
          </p>
        </div>
      </div>
    </div>
  );
}
