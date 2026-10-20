import { Check } from "lucide-react";
import BlackButton from "../buttons/black-button";

export default function PlanCard({ plan, onOpenModal, onSelectedPlan }) {
  const features = [
    `Hasta ${plan.maxStudents} alumnos`,
    `Hasta ${plan.maxProfessors} profesores`,
    "Gestión de turnos",
    "Control de cupos",
    "Panel administrativo",
    ...(plan.includesExercisesAndRoutines
      ? ["Ejercicios", "Rutinas de entrenamiento"]
      : []),
  ];

  return (
    <div className="min-[900px]:min-w-71.25 min-w-61.25 min-h-117.5 max-w-sm border rounded-lg border-gray-400 flex flex-col items-center gap-3 p-6 lg:p-8 lg:px-11 shadow-md">
      <h4 className="text-2xl lg:text-[28px] font-semibold text-center">
        {plan.name}
      </h4>

      <span className="font-semibold text-3xl lg:text-[40px] text-[#fc697b]">
        ${plan.price}
      </span>
      <ul className="my-4 space-y-2 flex-1 w-full items-center">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-2 text-[15px]">
            <Check size={16} className="text-green-500 shrink-0" />
            {feature}
          </li>
        ))}
      </ul>

      <BlackButton
        onClick={() => {
          onSelectedPlan(plan);
          onOpenModal(true);
        }}
        text="Contratar"
        wfit={true}
      />
    </div>
  );
}
