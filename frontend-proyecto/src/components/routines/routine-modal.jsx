import { X, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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

import AddExerciseModal from "./add-exercise-modal";

export default function RoutineModal({ routine, tenantId, close }) {
  const queryClient = useQueryClient();

  const userRoles = useTenantStore(
    (state) => state.userRolesInTenant[tenantId],
  );

  const isTenant = userRoles?.roles?.includes("Tenant");

  const [editing, setEditing] = useState(false);
  const [currentRoutine, setCurrentRoutine] = useState(routine);

  const [selectedExerciseId, setSelectedExerciseId] = useState("");

  const [backendError, setBackendError] = useState();
  const [errorModal, setErrorModal] = useState(false);

  const [successMessage, setSuccessMessage] = useState();
  const [successModal, setSuccessModal] = useState(false);

  const [confirmModal, setConfirmModal] = useState(false);

  const [openAddExerciseModal, setOpenAddExerciseModal] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(updateRoutineSchema),

    defaultValues: {
      name: routine.name || "",
      description: routine.description || "",
      exercises: (routine.exercises || []).map((exercise) => ({
        ...exercise,
        exerciseId: String(exercise.exerciseId),
      })),
    },

    mode: "onTouched",
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "exercises",
  });

  const { data: exercises = [], isLoading: exercisesLoading } = useQuery({
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
      }, 2000);
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
      } else if (data?.title) {
        msg = data.title;
      }

      setConfirmModal(false);
      setBackendError(msg);
      setErrorModal(true);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) =>
      updateRoutine(currentRoutine.id, {
        name: data.name.trim(),

        description: data.description?.trim() || null,

        exercises: (data.exercises || []).map((exercise) => ({
          exerciseId: Number(exercise.exerciseId),

          sets: Number(exercise.sets),

          repetitions: Number(exercise.repetitions),

          weight:
            exercise.weight === "" ||
            exercise.weight === undefined ||
            exercise.weight === null
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

      reset({
        name: updatedRoutine.name || "",

        description: updatedRoutine.description || "",

        exercises: (updatedRoutine.exercises || []).map((exercise) => ({
          ...exercise,
          exerciseId: String(exercise.exerciseId),
        })),
      });

      setEditing(false);

      setSuccessMessage("Rutina actualizada correctamente");
      setSuccessModal(true);

      setTimeout(() => {
        setSuccessModal(false);
      }, 2000);
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
      } else if (data?.title) {
        msg = data.title;
      }

      setBackendError(msg);
      setErrorModal(true);
    },
  });

  const handleStartEditing = () => {
    reset({
      name: currentRoutine.name || "",

      description: currentRoutine.description || "",

      exercises: (currentRoutine.exercises || []).map((exercise) => ({
        ...exercise,
        exerciseId: String(exercise.exerciseId),
      })),
    });

    setSelectedExerciseId("");
    setOpenAddExerciseModal(false);

    setEditing(true);
  };

  const handleCancelEdit = () => {
    reset({
      name: currentRoutine.name || "",

      description: currentRoutine.description || "",

      exercises: (currentRoutine.exercises || []).map((exercise) => ({
        ...exercise,
        exerciseId: String(exercise.exerciseId),
      })),
    });

    setSelectedExerciseId("");
    setOpenAddExerciseModal(false);

    setEditing(false);
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

    const nextOrder =
      fields.length > 0
        ? Math.max(...fields.map((exercise) => Number(exercise.order))) + 1
        : 1;

    append({
      exerciseId: String(selectedExercise.id),

      exercise: selectedExercise,

      sets: 3,

      repetitions: 10,

      weight: "",

      order: nextOrder,
    });

    setSelectedExerciseId("");
    setOpenAddExerciseModal(false);
  };

  const handleUpdate = (data) => {
    updateMutation.mutate(data);
  };

  return (
    <Modal open={true} onClose={close}>
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
        <form
          onSubmit={handleSubmit(handleUpdate)}
          className="space-y-6 max-h-[80vh] overflow-y-auto pr-1"
        >
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
              className={`w-full rounded-[13px] px-3 py-2 border ${
                errors.description ? "border-red-500" : "border-gray-300"
              } bg-[#efefef] resize-none focus:outline-none focus:ring-2 focus:ring-[#333]`}
            />

            {errors.description && (
              <p className="text-red-500 text-[13px] mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="border-t pt-5">
            <div className="flex items-center mb-3 justify-between">
              <h3 className="font-semibold text-lg">Ejercicios</h3>

              <BlackButton
                type="button"
                text="+ Agregar"
                textSmall={true}
                wfit={true}
                onClick={() => setOpenAddExerciseModal(true)}
              />
            </div>

            {fields.length > 0 ? (
              <div className="flex flex-col gap-3">
                {fields
                  .map((field, index) => ({
                    ...field,
                    originalIndex: index,
                  }))
                  .sort((a, b) => Number(a.order) - Number(b.order))
                  .map((exercise) => {
                    const index = exercise.originalIndex;

                    return (
                      <div key={exercise.id} className="border rounded-xl p-4">
                        <div className="flex justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-3">
                              <h4 className="font-semibold">
                                {exercise.order}. {exercise.exercise?.name}
                              </h4>

                              <RedButton
                                text=""
                                type="button"
                                onClick={() => remove(index)}
                                img={<Trash2 size={18} />}
                                wfit={true}
                                textSmall={true}
                              />
                            </div>

                            <div className="grid grid-cols-3 gap-2 mt-3">
                              <FormInput
                                label="Series"
                                id={`sets-${exercise.id}`}
                                type="number"
                                register={register(`exercises.${index}.sets`)}
                                error={errors.exercises?.[index]?.sets}
                              />

                              <FormInput
                                label="Reps"
                                id={`repetitions-${exercise.id}`}
                                type="number"
                                register={register(
                                  `exercises.${index}.repetitions`,
                                )}
                                error={errors.exercises?.[index]?.repetitions}
                              />

                              <FormInput
                                label="Peso"
                                id={`weight-${exercise.id}`}
                                type="number"
                                placeholder="Opcional"
                                register={register(`exercises.${index}.weight`)}
                                error={errors.exercises?.[index]?.weight}
                              />
                            </div>

                            <div className="mt-2">
                              <FormInput
                                label="Orden"
                                id={`order-${exercise.id}`}
                                type="number"
                                register={register(`exercises.${index}.order`)}
                                error={errors.exercises?.[index]?.order}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="border rounded-xl p-5 text-center text-gray-500">
                Esta rutina no tiene ejercicios.
              </div>
            )}

            {errors.exercises?.message && (
              <p className="text-red-500 text-[13px] mt-2">
                {errors.exercises.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <WhiteButton
              text="Cancelar"
              onClick={handleCancelEdit}
              textSmall={true}
              type="button"
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

      {openAddExerciseModal && (
        <AddExerciseModal
          close={() => setOpenAddExerciseModal(false)}
          selectedExerciseId={selectedExerciseId}
          setSelectedExerciseId={setSelectedExerciseId}
          exercisesLoading={exercisesLoading}
          exercises={exercises}
          handleAddExercise={handleAddExercise}
        />
      )}
    </Modal>
  );
}
