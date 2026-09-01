import { X, Trash2, Plus } from "lucide-react";
import { useState } from "react";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import Modal from "../modals/modal";
import ErrorModal from "../modals/error-modal";
import SuccessModal from "../modals/success-modal";

import WhiteButton from "../buttons/white-button";
import BlackButton from "../buttons/black-button";
import RedButton from "../buttons/red-button";

import { getExercises } from "../../services/exercise";
import { createRoutine } from "../../services/routine";
import { createRoutineSchema } from "../../schema/routine-schema";
import FormInput from "../form-input";
import AddExerciseModal from "./add-exercise-modal";

export default function RoutineForm({ tenantId, close }) {
  const queryClient = useQueryClient();

  const [selectedExerciseId, setSelectedExerciseId] = useState("");
  const [backendError, setBackendError] = useState();
  const [errorModal, setErrorModal] = useState(false);

  const [successMessage, setSuccessMessage] = useState();
  const [successModal, setSuccessModal] = useState(false);

  const [openAddExerciseModal, setOpenAddExerciseModal] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createRoutineSchema),
    defaultValues: {
      name: "",
      description: "",
      exercises: [],
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
      }, 2000);
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

  const handleAddExercise = () => {
    if (!selectedExerciseId) {
      setBackendError("Seleccioná un ejercicio");
      setErrorModal(true);
      return;
    }

    const exercise = exercises.find((e) => e.id === Number(selectedExerciseId));

    if (!exercise) return;

    const nextOrder =
      fields.length > 0
        ? Math.max(...fields.map((e) => Number(e.order))) + 1
        : 1;

    append({
      exerciseId: String(exercise.id),
      exercise: exercise,
      sets: 3,
      repetitions: 10,
      weight: "",
      order: nextOrder,
    });

    setSelectedExerciseId("");
  };

  const handleRemoveExercise = (index) => {
    remove(index);
  };

  const onSubmit = (data) => {
    mutation.mutate({
      name: data.name.trim(),
      description: data.description?.trim() || null,

      exercises: data.exercises.map((exercise) => ({
        exerciseId: Number(exercise.exerciseId),
        sets: Number(exercise.sets),
        repetitions: Number(exercise.repetitions),
        weight:
          exercise.weight === "" || exercise.weight === undefined
            ? null
            : Number(exercise.weight),
        order: Number(exercise.order),
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

      <form onSubmit={handleSubmit(onSubmit)} className=" space-y-6">
        <h2 className="text-2xl font-semibold text-center">Crear una rutina</h2>

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

        <div className="border-t pt-5">
          <div className="flex items-center mb-3 justify-between">
            <h3 className="font-semibold text-lg ">Ejercicios</h3>
            <BlackButton
              type={"button"}
              text={"+ Agregar"}
              textSmall={true}
              wfit={true}
              onClick={() => setOpenAddExerciseModal(true)}
            />
          </div>
          {fields.length > 0 ? (
            <div className="flex flex-col gap-3">
              {fields
                .map((field, index) => ({ ...field, originalIndex: index }))
                .sort((a, b) => Number(a.order) - Number(b.order))
                .map((exercise) => {
                  const index = exercise.originalIndex;

                  return (
                    <div key={exercise.id} className="border rounded-xl p-4">
                      <div className="flex justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">
                              {exercise.order}. {exercise.exercise?.name}
                            </h4>
                            <RedButton
                              text=""
                              onClick={() => handleRemoveExercise(index)}
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

                          <div className="mt-2 flex">
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
              Todavía no agregaste ejercicios.
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
            onClick={close}
            textSmall={true}
            type="button"
          />

          <BlackButton
            text={mutation.isPending ? "Creando..." : "Crear rutina"}
            type="submit"
            disabled={mutation.isPending}
            textSmall={true}
          />
        </div>
      </form>

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
