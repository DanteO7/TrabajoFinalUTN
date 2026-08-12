import { Check } from "lucide-react";
import BlackButton from "../buttons/black-button";

export default function PlanCard({ plan, onOpenModal, onSelectedPlan }) {
  return (
    <div className="border rounded-2xl flex flex-col items-center gap-3 p-6 lg:p-9 lg:px-12">
      <h4 className="text-2xl lg:text-3xl">{plan.name}</h4>
      <span className="font-semibold text-3xl lg:text-[40px]">
        ${plan.price}
      </span>
      <ul className="my-4 space-y-2">
        <li className="flex items-center gap-2">
          <Check size={16} className="text-green-500" />
          Hasta {plan.maxStudents} alumnos
        </li>
        <li className="flex items-center gap-2">
          <Check size={16} className="text-green-500" />
          Hasta {plan.maxProfessors} profesores
        </li>
        <li className="flex items-center gap-2">
          <Check size={16} className="text-green-500" />
          Gestión de turnos
        </li>
        <li className="flex items-center gap-2">
          <Check size={16} className="text-green-500" />
          Control de cupos
        </li>
        <li className="flex items-center gap-2">
          <Check size={16} className="text-green-500" />
          Panel administrativo
        </li>
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
