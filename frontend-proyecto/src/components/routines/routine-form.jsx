import { X, Trash2, Plus } from "lucide-react";

import { useState } from "react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import Modal from "../modals/modal";
import ErrorModal from "../modals/error-modal";
import SuccessModal from "../modals/success-modal";

import WhiteButton from "../buttons/white-button";
import BlackButton from "../buttons/black-button";

import { getExercises } from "../../services/exercise";
import { createRoutine } from "../../services/routine";

export default function RoutineForm({ tenantId, close }) {
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [selectedExerciseId, setSelectedExerciseId] = useState("");

  const [sets, setSets] = useState(3);
  const [repetitions, setRepetitions] = useState(10);
  const [weight, setWeight] = useState("");
  const [order, setOrder] = useState(1);

  const [routineExercises, setRoutineExercises] = useState([]);

  const [backendError, setBackendError] = useState();
  const [errorModal, setErrorModal] = useState(false);

  const [successMessage, setSuccessMessage] = useState();
  const [successModal, setSuccessModal] = useState(false);

  const { data: exercises = [], isLoading: exercisesLoading } = useQuery({
    queryKey: ["getExercises", tenantId],
    queryFn: () => getExercises(tenantId),
  });

  const mutation = useMutation({
    mutationFn: createRoutine,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["getRoutines", tenantId],
      });

      setSuccessMessage("Rutina creada correctamente");
      setSuccessModal(true);

      setTimeout(() => {
        close();
      }, 3000);
    },

    onError: (error) => {
      const data = error?.response?.data;

      let msg = "Ocurrió un error al crear la rutina";

      if (typeof data === "string") {
        msg = data;
      } else if (data?.errors) {
        msg = Object.values(data.errors).flat().join(" - ");
      } else if (data?.message) {
        msg = data.message;
      } else if (data?.title) {
        msg = data.title;
      }

      setBackendError(msg);
      setErrorModal(true);
    },
  });

  const addExercise = () => {
    if (!selectedExerciseId) {
      setBackendError("Seleccioná un ejercicio");
      setErrorModal(true);
      return;
    }

    const exercise = exercises.find((e) => e.id === Number(selectedExerciseId));

    if (!exercise) return;

    if (routineExercises.some((e) => e.exerciseId === exercise.id)) {
      setBackendError("Ese ejercicio ya fue agregado a la rutina");
      setErrorModal(true);
      return;
    }

    if (routineExercises.some((e) => e.order === Number(order))) {
      setBackendError("Ya existe un ejercicio con ese orden");
      setErrorModal(true);
      return;
    }

    setRoutineExercises((prev) => [
      ...prev,
      {
        exerciseId: exercise.id,
        exercise: exercise,
        sets: Number(sets),
        repetitions: Number(repetitions),
        weight: weight === "" ? null : Number(weight),
        order: Number(order),
      },
    ]);

    setSelectedExerciseId("");
    setSets(3);
    setRepetitions(10);
    setWeight("");

    setOrder((prev) => Number(prev) + 1);
  };

  const removeExercise = (exerciseId) => {
    setRoutineExercises((prev) =>
      prev.filter((e) => e.exerciseId !== exerciseId),
    );
  };

  const onSubmit = () => {
    if (!name.trim()) {
      setBackendError("El nombre de la rutina es obligatorio");
      setErrorModal(true);
      return;
    }

    mutation.mutate({
      name: name.trim(),
      description: description || null,

      exercises: routineExercises.map((exercise) => ({
        exerciseId: exercise.exerciseId,
        sets: exercise.sets,
        repetitions: exercise.repetitions,
        weight: exercise.weight,
        order: exercise.order,
      })),
    });
  };

  return (
    <Modal open={true} onClose={close}>
      <button
        onClick={close}
        className="absolute top-4 right-4 text-gray-500 hover:text-black transition duration-200 cursor-pointer"
      >
        <X size={20} />
      </button>

      <h2 className="text-2xl font-semibold mb-6 text-center">
        Crear una rutina
      </h2>

      <div className="flex flex-col gap-5 max-h-[75vh] overflow-y-auto pr-1">
        <div>
          <label className="block text-sm font-semibold mb-2">Nombre</label>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Rutina de fuerza"
            maxLength={50}
            className="w-full border rounded-xl px-3 py-2 bg-[#efefef] focus:outline-none focus:ring-2 focus:ring-[#333]"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">
            Descripción (opcional)
          </label>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            maxLength={300}
            placeholder="Descripción de la rutina..."
            className="w-full rounded-xl px-3 py-2 border border-gray-300 bg-[#efefef] resize-none focus:outline-none focus:ring-2 focus:ring-[#333]"
          />
        </div>

        <div className="border-t pt-5">
          <h3 className="font-semibold text-lg mb-4">Agregar ejercicios</h3>

          <div className="flex flex-col gap-3">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Ejercicio
              </label>

              <select
                value={selectedExerciseId}
                onChange={(e) => setSelectedExerciseId(e.target.value)}
                disabled={exercisesLoading}
                className="w-full border rounded-xl px-3 py-2 bg-[#efefef] focus:outline-none focus:ring-2 focus:ring-[#333]"
              >
                <option value="">
                  {exercisesLoading
                    ? "Cargando ejercicios..."
                    : "Seleccionar ejercicio"}
                </option>

                {exercises
                  .filter(
                    (exercise) =>
                      !routineExercises.some(
                        (re) => re.exerciseId === exercise.id,
                      ),
                  )
                  .map((exercise) => (
                    <option key={exercise.id} value={exercise.id}>
                      {exercise.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Series
                </label>

                <input
                  type="number"
                  min="1"
                  value={sets}
                  onChange={(e) => setSets(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 bg-[#efefef]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Repeticiones
                </label>

                <input
                  type="number"
                  min="1"
                  value={repetitions}
                  onChange={(e) => setRepetitions(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 bg-[#efefef]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Peso</label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Opcional"
                  className="w-full border rounded-xl px-3 py-2 bg-[#efefef]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Orden
                </label>

                <input
                  type="number"
                  min="1"
                  value={order}
                  onChange={(e) => setOrder(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2 bg-[#efefef]"
                />
              </div>
            </div>

            <BlackButton
              text="Agregar ejercicio"
              onClick={addExercise}
              textSmall={true}
              img={<Plus size={18} />}
              disabled={!selectedExerciseId}
            />
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-3">
            Ejercicios de la rutina
          </h3>

          {routineExercises.length === 0 ? (
            <div className="border rounded-xl p-5 text-center text-gray-500">
              Todavía no agregaste ejercicios.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {[...routineExercises]
                .sort((a, b) => a.order - b.order)
                .map((exercise) => (
                  <div
                    key={exercise.exerciseId}
                    className="border rounded-xl p-4 flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <h4 className="font-semibold">
                        {exercise.order}. {exercise.exercise.name}
                      </h4>

                      <p className="text-sm text-gray-500 mt-1">
                        {exercise.sets} series × {exercise.repetitions} reps
                        {exercise.weight !== null && ` · ${exercise.weight} kg`}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeExercise(exercise.exerciseId)}
                      className="text-red-500 hover:text-red-700 cursor-pointer shrink-0"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <WhiteButton text="Cancelar" onClick={close} textSmall={true} />

          <BlackButton
            text={mutation.isPending ? "Creando..." : "Crear rutina"}
            onClick={onSubmit}
            disabled={mutation.isPending}
            textSmall={true}
          />
        </div>
      </div>

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
