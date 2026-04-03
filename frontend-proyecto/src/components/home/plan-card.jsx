import { Check } from "lucide-react";

export default function PlanCard({ plan, onOpenModal, onSelectedPlan }) {
  return (
    <div className="border rounded-2xl flex flex-col items-center gap-3 p-6">
      <h4 className="text-2xl">{plan.name}</h4>
      <span className="text-3xl">${plan.price}</span>
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
      <button
        onClick={() => {
          onSelectedPlan(plan);
          onOpenModal(true);
        }}
        className="text-[#efefef] bg-[#333] rounded-[14px] px-5 py-2 cursor-pointer border-[1.7px] border-[#333] hover:bg-gray-300 hover:text-[#333] hover:border-gray-400 transition duration-300"
      >
        Contratar
      </button>
    </div>
  );
}
