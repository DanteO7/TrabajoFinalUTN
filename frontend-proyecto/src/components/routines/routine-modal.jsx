import { X, Pencil, Trash2, Plus } from "lucide-react";

import { useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import Modal from "../modals/modal";

import { updateRoutine, deleteRoutine } from "../../services/routine";

import { getExercises } from "../../services/exercise";

import SuccessModal from "../modals/success-modal";

import ErrorModal from "../modals/error-modal";

import ConfirmModal from "../modals/confirm-modal";

import { useTenantStore } from "../../store/tenant-store";

import WhiteButton from "../buttons/white-button";

import BlackButton from "../buttons/black-button";

import RedButton from "../buttons/red-button";

import FormInput from "../form-input";

import { updateRoutineSchema } from "../../schema/routine-schema";

export default function RoutineModal({ routine, tenantId, close }) {
  const queryClient = useQueryClient();

  const userRoles = useTenantStore(
    (state) => state.userRolesInTenant[tenantId],
  );

  const isTenant = userRoles?.roles?.includes("Tenant");

  const [editing, setEditing] = useState(false);

  const [currentRoutine, setCurrentRoutine] = useState(routine);

  // Lista de ejercicios que se está editando localmente
  const [routineExercises, setRoutineExercises] = useState(
    routine.exercises || [],
  );

  // Datos del nuevo ejercicio que queremos agregar
  const [selectedExerciseId, setSelectedExerciseId] = useState("");
  const [sets, setSets] = useState(3);
  const [repetitions, setRepetitions] = useState(10);
  const [weight, setWeight] = useState("");

  const [backendError, setBackendError] = useState();
  const [errorModal, setErrorModal] = useState(false);

  const [successMessage, setSuccessMessage] = useState();
  const [successModal, setSuccessModal] = useState(false);

  const [confirmModal, setConfirmModal] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(updateRoutineSchema),

    defaultValues: {
      name: routine.name || "",
      description: routine.description || "",
    },

    mode: "onTouched",
  });

  const { data: exercises = [] } = useQuery({
    queryKey: ["getExercises", tenantId],
    queryFn: () => getExercises(tenantId),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteRoutine(currentRoutine.id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["getRoutines", tenantId],
      });

      setConfirmModal(false);

      setSuccessMessage("Rutina eliminada correctamente");
      setSuccessModal(true);

      setTimeout(() => {
        close();
      }, 3000);
    },

    onError: (error) => {
      const data = error?.response?.data;

      let msg = "Ocurrió un error al eliminar la rutina";

      if (typeof data === "string") {
        msg = data;
      } else if (data?.errors) {
        msg = Object.values(data.errors).flat().join(" - ");
      } else if (data?.message) {
        msg = data.message;
      }

      setConfirmModal(false);
      setBackendError(msg);
      setErrorModal(true);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) =>
      updateRoutine(currentRoutine.id, {
        name: data.name,
        description: data.description || null,

        exercises: routineExercises.map((exercise) => ({
          exerciseId: exercise.exerciseId,
          sets: Number(exercise.sets),
          repetitions: Number(exercise.repetitions),
          weight:
            exercise.weight === null ||
            exercise.weight === undefined ||
            exercise.weight === ""
              ? null
              : Number(exercise.weight),
          order: Number(exercise.order),
        })),
      }),

    onSuccess: (updatedRoutine) => {
      queryClient.invalidateQueries({
        queryKey: ["getRoutines", tenantId],
      });

      setCurrentRoutine(updatedRoutine);

      setRoutineExercises(updatedRoutine.exercises || []);

      reset({
        name: updatedRoutine.name || "",
        description: updatedRoutine.description || "",
      });

      setEditing(false);

      setSuccessMessage("Rutina actualizada correctamente");
      setSuccessModal(true);

      setTimeout(() => {
        setSuccessModal(false);
      }, 3000);
    },

    onError: (error) => {
      const data = error?.response?.data;

      let msg = "Ocurrió un error al actualizar la rutina";

      if (typeof data === "string") {
        msg = data;
      } else if (data?.errors) {
        msg = Object.values(data.errors).flat().join(" - ");
      } else if (data?.message) {
        msg = data.message;
      }

      setBackendError(msg);
      setErrorModal(true);
    },
  });

  const handleUpdate = (data) => {
    updateMutation.mutate(data);
  };

  const handleCancelEdit = () => {
    setEditing(false);

    reset({
      name: currentRoutine.name || "",
      description: currentRoutine.description || "",
    });

    // Restauramos los ejercicios originales
    setRoutineExercises(currentRoutine.exercises || []);

    setSelectedExerciseId("");
    setSets(3);
    setRepetitions(10);
    setWeight("");
  };

  const handleStartEditing = () => {
    reset({
      name: currentRoutine.name || "",
      description: currentRoutine.description || "",
    });

    // Copiamos la lista para editarla localmente
    setRoutineExercises(currentRoutine.exercises || []);

    setSelectedExerciseId("");
    setSets(3);
    setRepetitions(10);
    setWeight("");

    setEditing(true);
  };

  const handleAddExercise = () => {
    if (!selectedExerciseId) {
      setBackendError("Seleccioná un ejercicio");
      setErrorModal(true);
      return;
    }

    const selectedExercise = exercises.find(
      (exercise) => exercise.id === Number(selectedExerciseId),
    );

    if (!selectedExercise) {
      return;
    }

    const newOrder = routineExercises.length + 1;

    const newRoutineExercise = {
      // ID temporal para React
      id: `new-${Date.now()}`,

      exerciseId: selectedExercise.id,

      exercise: selectedExercise,

      sets: Number(sets),
      repetitions: Number(repetitions),

      weight: weight === "" ? null : Number(weight),

      order: newOrder,
    };

    setRoutineExercises((prev) => [...prev, newRoutineExercise]);

    // Limpiamos solamente los datos del nuevo ejercicio
    setSelectedExerciseId("");
    setSets(3);
    setRepetitions(10);
    setWeight("");
  };

  const handleRemoveExercise = (routineExerciseId) => {
    setRoutineExercises((prev) =>
      prev.filter((exercise) => exercise.id !== routineExerciseId),
    );
  };

  const handleOrderChange = (routineExerciseId, newOrder) => {
    setRoutineExercises((prev) =>
      prev.map((exercise) =>
        exercise.id === routineExerciseId
          ? {
              ...exercise,
              order: Number(newOrder),
            }
          : exercise,
      ),
    );
  };

  const handleExerciseFieldChange = (routineExerciseId, field, value) => {
    setRoutineExercises((prev) =>
      prev.map((exercise) =>
        exercise.id === routineExerciseId
          ? {
              ...exercise,
              [field]: value,
            }
          : exercise,
      ),
    );
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
          <h2 className="text-2xl font-semibold mb-2">{currentRoutine.name}</h2>

          <p className="text-gray-600 whitespace-pre-wrap">
            {currentRoutine.description || "Sin descripción"}
          </p>

          <div className="mt-7">
            <h3 className="font-semibold text-lg mb-3">Ejercicios</h3>

            {currentRoutine.exercises?.length > 0 ? (
              <div className="flex flex-col gap-3">
                {[...currentRoutine.exercises]
                  .sort((a, b) => a.order - b.order)
                  .map((exercise) => (
                    <div key={exercise.id} className="border rounded-xl p-4">
                      <h4 className="font-semibold">
                        {exercise.order}. {exercise.exercise?.name}
                      </h4>

                      <p className="text-sm text-gray-500 mt-1">
                        {exercise.sets} series × {exercise.repetitions} reps
                        {exercise.weight !== null &&
                          exercise.weight !== undefined &&
                          ` · ${exercise.weight} kg`}
                      </p>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="border rounded-xl p-5 text-center text-gray-500">
                Esta rutina no tiene ejercicios.
              </div>
            )}
          </div>

          {isTenant && (
            <div className="flex gap-2 mt-8">
              <RedButton
                text="Eliminar"
                disabled={deleteMutation.isPending}
                onClick={() => setConfirmModal(true)}
                textSmall={true}
                img={<Trash2 size={18} />}
              />

              <BlackButton
                text="Editar"
                onClick={handleStartEditing}
                textSmall={true}
                img={<Pencil size={18} />}
              />
            </div>
          )}
        </>
      ) : (
        <form onSubmit={handleSubmit(handleUpdate)} className="space-y-6">
          <h2 className="text-2xl font-semibold text-center">Editar rutina</h2>

          <FormInput
            label="Nombre de la rutina"
            id="name"
            placeholder="Ej: Rutina de pecho"
            register={register("name")}
            error={errors.name}
          />

          <div>
            <label htmlFor="description" className="block mb-2">
              Descripción (opcional)
            </label>

            <textarea
              id="description"
              rows={4}
              placeholder="Descripción de la rutina..."
              {...register("description")}
              className="w-full rounded-[13px] px-3 py-2 border border-gray-300 bg-[#efefef] resize-none focus:outline-none focus:ring-2 focus:ring-[#333]"
            />

            {errors.description && (
              <p className="text-red-500 text-[13px] mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* EJERCICIOS DE LA RUTINA */}
          <div className="border-t pt-5">
            <h3 className="font-semibold text-lg mb-3">Ejercicios</h3>

            {routineExercises.length > 0 ? (
              <div className="flex flex-col gap-3">
                {[...routineExercises]
                  .sort((a, b) => a.order - b.order)
                  .map((exercise) => (
                    <div key={exercise.id} className="border rounded-xl p-4">
                      <div className="flex justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold">
                            {exercise.order}. {exercise.exercise?.name}
                          </h4>

                          <div className="grid grid-cols-3 gap-2 mt-3">
                            <input
                              type="number"
                              min="1"
                              value={exercise.sets}
                              onChange={(e) =>
                                handleExerciseFieldChange(
                                  exercise.id,
                                  "sets",
                                  Number(e.target.value),
                                )
                              }
                              className="w-full border rounded-xl px-3 py-2 bg-[#efefef]"
                              placeholder="Series"
                            />

                            <input
                              type="number"
                              min="1"
                              value={exercise.repetitions}
                              onChange={(e) =>
                                handleExerciseFieldChange(
                                  exercise.id,
                                  "repetitions",
                                  Number(e.target.value),
                                )
                              }
                              className="w-full border rounded-xl px-3 py-2 bg-[#efefef]"
                              placeholder="Reps"
                            />

                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={exercise.weight ?? ""}
                              onChange={(e) =>
                                handleExerciseFieldChange(
                                  exercise.id,
                                  "weight",
                                  e.target.value === ""
                                    ? null
                                    : Number(e.target.value),
                                )
                              }
                              className="w-full border rounded-xl px-3 py-2 bg-[#efefef]"
                              placeholder="Peso"
                            />
                          </div>

                          <div className="mt-2">
                            <input
                              type="number"
                              min="1"
                              value={exercise.order}
                              onChange={(e) =>
                                handleOrderChange(exercise.id, e.target.value)
                              }
                              className="w-full border rounded-xl px-3 py-2 bg-[#efefef]"
                              placeholder="Orden"
                            />
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveExercise(exercise.id)}
                          className="text-red-500 hover:text-red-700 cursor-pointer shrink-0"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="border rounded-xl p-5 text-center text-gray-500">
                Esta rutina no tiene ejercicios.
              </div>
            )}
          </div>

          {/* AGREGAR EJERCICIO */}
          <div className="border-t pt-5">
            <h3 className="font-semibold text-lg mb-4">Agregar ejercicio</h3>

            <div className="flex flex-col gap-3">
              <select
                value={selectedExerciseId}
                onChange={(e) => setSelectedExerciseId(e.target.value)}
                className="w-full border rounded-xl px-3 py-2 bg-[#efefef]"
              >
                <option value="">Seleccionar ejercicio</option>

                {/* TODOS los ejercicios */}
                {exercises.map((exercise) => (
                  <option key={exercise.id} value={exercise.id}>
                    {exercise.name}
                  </option>
                ))}
              </select>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <input
                  type="number"
                  min="1"
                  value={sets}
                  onChange={(e) => setSets(e.target.value)}
                  placeholder="Series"
                  className="w-full border rounded-xl px-3 py-2 bg-[#efefef]"
                />

                <input
                  type="number"
                  min="1"
                  value={repetitions}
                  onChange={(e) => setRepetitions(e.target.value)}
                  placeholder="Reps"
                  className="w-full border rounded-xl px-3 py-2 bg-[#efefef]"
                />

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Peso"
                  className="w-full border rounded-xl px-3 py-2 bg-[#efefef]"
                />

                <input
                  type="number"
                  min="1"
                  value={routineExercises.length + 1}
                  disabled
                  className="w-full border rounded-xl px-3 py-2 bg-[#efefef]"
                  placeholder="Orden"
                />
              </div>

              <BlackButton
                text="Agregar ejercicio"
                onClick={handleAddExercise}
                disabled={!selectedExerciseId}
                textSmall={true}
                img={<Plus size={18} />}
              />
            </div>
          </div>

          {/* BOTONES */}
          <div className="grid grid-cols-2 gap-3">
            <WhiteButton
              text="Cancelar"
              onClick={handleCancelEdit}
              textSmall={true}
            />

            <BlackButton
              text={updateMutation.isPending ? "Actualizando..." : "Actualizar"}
              type="submit"
              disabled={updateMutation.isPending}
              textSmall={true}
            />
          </div>
        </form>
      )}

      {confirmModal && (
        <ConfirmModal
          title="¿Eliminar esta rutina?"
          message={`Estás por eliminar la rutina "${currentRoutine.name}". Esta acción no se puede deshacer.`}
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
