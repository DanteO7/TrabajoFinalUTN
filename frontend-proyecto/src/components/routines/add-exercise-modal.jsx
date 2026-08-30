import { Plus } from "lucide-react";
import Modal from "../modals/modal";
import BlackButton from "../buttons/black-button";
import { X } from "lucide-react";

export default function AddExerciseModal({
  close,
  selectedExerciseId,
  setSelectedExerciseId,
  exercisesLoading,
  exercises,
  handleAddExercise,
}) {
  return (
    <Modal open={true} onClose={close}>
      <button
        onClick={close}
        className="absolute top-4 right-4 text-gray-500 hover:text-black transition duration-200 cursor-pointer"
      >
        <X size={20} />
      </button>
      <div className="">
        <h3 className="font-semibold text-lg mb-4">Agregar ejercicio</h3>

        <div className="flex flex-col gap-3">
          <div>
            <label htmlFor="exercise" className="block mb-2">
              Ejercicio
            </label>

            <select
              id="exercise"
              value={selectedExerciseId}
              onChange={(e) => setSelectedExerciseId(e.target.value)}
              disabled={exercisesLoading}
              className="w-full rounded-[13px] px-3 py-2 border border-gray-300 bg-[#efefef] focus:outline-none focus:ring-2 focus:ring-[#333]"
            >
              <option value="">
                {exercisesLoading
                  ? "Cargando ejercicios..."
                  : "Seleccionar ejercicio"}
              </option>

              {exercises.map((exercise) => (
                <option key={exercise.id} value={exercise.id}>
                  {exercise.name}
                </option>
              ))}
            </select>
          </div>

          <BlackButton
            text="Agregar ejercicio"
            onClick={handleAddExercise}
            disabled={!selectedExerciseId}
            textSmall={true}
            img={<Plus size={18} />}
            type="button"
          />
        </div>
      </div>
    </Modal>
  );
}
