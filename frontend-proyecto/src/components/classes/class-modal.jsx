import { X, Pencil } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import Modal from "../modals/modal";
import FormInput from "../form-input";
import SuccessModal from "../modals/success-modal";
import ErrorModal from "../modals/error-modal";

import { updateClass, deleteClass } from "../../services/class";
import { getActivities } from "../../services/activity";
import { getProfessors } from "../../services/professor";

export default function ClassModal({ classItem, tenantId, close }) {
  const queryClient = useQueryClient();

  const [editing, setEditing] = useState(false);
  const [currentClass, setCurrentClass] = useState(classItem);

  const [deleteModal, setDeleteModal] = useState(false);

  const [backendError, setBackendError] = useState();
  const [errorModal, setErrorModal] = useState(false);

  const [successMessage, setSuccessMessage] = useState();
  const [successModal, setSuccessModal] = useState(false);

  const { data: activities = [] } = useQuery({
    queryKey: ["getActivities", tenantId],
    queryFn: () => getActivities(tenantId),
  });

  const { data: professors = [] } = useQuery({
    queryKey: ["getProfessors", tenantId],
    queryFn: () => getProfessors(tenantId),
  });

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      activityId: classItem.activityId,
      professorId: classItem.professorId,
      date: classItem.date?.split("T")[0],
      startTime: classItem.startTime?.slice(0, 5),
      endTime: classItem.endTime?.slice(0, 5),
      maxCapacity: classItem.maxCapacity,
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => updateClass(currentClass.id, data),

    onSuccess: (updatedClass) => {
      queryClient.invalidateQueries({
        queryKey: ["getClasses", tenantId],
      });

      setCurrentClass(updatedClass);

      reset({
        activityId: updatedClass.activityId,
        professorId: updatedClass.professorId,
        date: updatedClass.date?.split("T")[0],
        startTime: updatedClass.startTime?.slice(0, 5),
        endTime: updatedClass.endTime?.slice(0, 5),
        maxCapacity: updatedClass.maxCapacity,
      });

      setEditing(false);

      setSuccessMessage("Clase actualizada correctamente");
      setSuccessModal(true);

      setTimeout(() => setSuccessModal(false), 3000);
    },

    onError: (error) => {
      const data = error?.response?.data;

      let msg = "Ocurrió un error al actualizar la clase";

      if (typeof data === "string") msg = data;
      else if (data?.errors)
        msg = Object.values(data.errors).flat().join(" - ");
      else if (data?.title) msg = data.title;

      setBackendError(msg);
      setErrorModal(true);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteClass(currentClass.id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["getClasses", tenantId],
      });

      setDeleteModal(false);

      setSuccessMessage("Clase eliminada correctamente");
      setSuccessModal(true);

      setTimeout(() => {
        close();
      }, 3000);
    },

    onError: (error) => {
      const data = error?.response?.data;

      let msg = "Ocurrió un error al eliminar la clase";

      if (typeof data === "string") msg = data;
      else if (data?.errors)
        msg = Object.values(data.errors).flat().join(" - ");
      else if (data?.title) msg = data.title;

      setBackendError(msg);
      setErrorModal(true);
    },
  });

  const onSubmit = (form) => {
    updateMutation.mutate({
      ...form,
      activityId: Number(form.activityId),
      professorId: Number(form.professorId),
      maxCapacity: Number(form.maxCapacity),
    });
  };

  return (
    <Modal open onClose={close}>
      <button
        onClick={close}
        className="absolute top-4 right-4 text-gray-500 hover:text-black"
      >
        <X size={20} />
      </button>

      {!editing ? (
        <>
          <h2 className="text-2xl font-semibold mb-5">
            {currentClass.activity.name}
          </h2>

          <div className="space-y-2 text-gray-600">
            <p>
              <b>Profesor:</b> {currentClass.professor.user?.name}{" "}
              {currentClass.professor.user?.surname}
            </p>

            <p>
              <b>Fecha:</b> {new Date(currentClass.date).toLocaleDateString()}
            </p>

            <p>
              <b>Horario:</b> {currentClass.startTime.slice(0, 5)} -{" "}
              {currentClass.endTime.slice(0, 5)}
            </p>

            <p>
              <b>Capacidad:</b> {currentClass.reservationsCount}/
              {currentClass.maxCapacity}
            </p>

            <p>
              <b>Lugares disponibles:</b> {currentClass.availableSpots}
            </p>
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <button
              onClick={() => setDeleteModal(true)}
              className="text-red-600 border border-red-600 rounded-xl px-4 py-2 hover:bg-red-600 hover:text-white transition cursor-pointer"
            >
              Eliminar clase
            </button>

            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 bg-[#333] text-white px-4 py-2 rounded-xl hover:bg-gray-700"
            >
              <Pencil size={18} />
              Editar
            </button>
          </div>
        </>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <h2 className="text-2xl font-semibold text-center">Editar clase</h2>

          <div>
            <label className="block mb-2">Actividad</label>

            <select
              {...register("activityId")}
              className="w-full rounded-xl border bg-[#efefef] px-3 py-2"
            >
              {activities.map((activity) => (
                <option key={activity.id} value={activity.id}>
                  {activity.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2">Profesor</label>

            <select
              {...register("professorId")}
              className="w-full rounded-xl border bg-[#efefef] px-3 py-2"
            >
              {professors.map((professor) => (
                <option key={professor.id} value={professor.id}>
                  {professor.user.name} {professor.user.surname}
                </option>
              ))}
            </select>
          </div>

          <FormInput type="date" label="Fecha" register={register("date")} />

          <div className="grid grid-cols-2 gap-4">
            <FormInput
              type="time"
              label="Hora inicio"
              register={register("startTime")}
            />

            <FormInput
              type="time"
              label="Hora fin"
              register={register("endTime")}
            />
          </div>

          <FormInput
            type="number"
            label="Capacidad máxima"
            register={register("maxCapacity")}
          />

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                reset();
                setEditing(false);
              }}
              className="border px-4 py-2 rounded-xl"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="bg-[#333] text-white px-4 py-2 rounded-xl hover:bg-gray-700"
            >
              Guardar cambios
            </button>
          </div>
        </form>
      )}

      {errorModal && (
        <ErrorModal
          close={() => setErrorModal(false)}
          message={backendError}
          isSuccesOrError
        />
      )}

      {successModal && (
        <SuccessModal
          close={() => setSuccessModal(false)}
          message={successMessage}
          isSuccesOrError
        />
      )}

      {deleteModal && (
        <Modal open onClose={() => setDeleteModal(false)}>
          <h2 className="text-2xl font-semibold text-center">Eliminar clase</h2>

          <p className="text-center mt-5">
            ¿Seguro que querés eliminar esta clase?
          </p>

          <p className="text-center text-gray-500 mt-2">
            Esta acción no se puede deshacer.
          </p>

          <div className="flex justify-end gap-3 mt-8">
            <button
              onClick={() => setDeleteModal(false)}
              className="border rounded-xl px-4 py-2"
            >
              Cancelar
            </button>

            <button
              onClick={() => deleteMutation.mutate()}
              className="bg-red-600 text-white rounded-xl px-4 py-2 hover:bg-red-700"
            >
              Eliminar
            </button>
          </div>
        </Modal>
      )}
    </Modal>
  );
}
