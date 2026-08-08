import { X, Pencil } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Modal from "../modals/modal";
import FormInput from "../form-input";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { updateClass, deleteClass } from "../../services/class";
import { getActivities } from "../../services/activity";
import { getProfessors } from "../../services/professor";
import {
  createReservation,
  deleteReservation,
  getReservationsByStudentId,
} from "../../services/reservation";
import SuccessModal from "../modals/success-modal";
import ErrorModal from "../modals/error-modal";
import { updateClassSchema } from "../../schema/class-schema";
import { useAuthStore } from "../../store/auth-store";
import { useTenantStore } from "../../store/tenant-store";
import { getStudentByUser } from "../../services/student";
import ClassStudentsModal from "./class-students-modal";
import ConfirmModal from "../modals/confirm-modal";

export default function ClassModal({ classItem, tenantId, close }) {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const userRoles = useTenantStore(
    (state) => state.userRolesInTenant[tenantId],
  );
  const canEdit =
    userRoles?.roles?.includes("Tenant") ||
    userRoles?.roles?.includes("Professor");
  const isStudent = userRoles?.roles?.includes("Student");

  const [editing, setEditing] = useState(false);
  const [currentClass, setCurrentClass] = useState(classItem);

  const [backendError, setBackendError] = useState();
  const [errorModal, setErrorModal] = useState(false);

  const [successMessage, setSuccessMessage] = useState();
  const [successModal, setSuccessModal] = useState(false);

  const [studentsModal, setStudentsModal] = useState(false);

  const [confirmModal, setConfirmModal] = useState(false);

  const classStart = new Date(
    `${currentClass.date.split("T")[0]}T${currentClass.startTime}`,
  );

  const classStarted = new Date() >= classStart;

  const formatDateWithDay = (dateString) => {
    const [year, month, day] = dateString.split("T")[0].split("-");
    const date = new Date(year, month - 1, day);

    const dayName = date.toLocaleDateString("es-AR", { weekday: "long" });
    const dateFormatted = date.toLocaleDateString("es-AR");

    return `${dayName.charAt(0).toUpperCase() + dayName.slice(1)} ${dateFormatted}`;
  };
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(updateClassSchema),
    mode: "onTouched",
    defaultValues: {
      activityId: currentClass.activityId?.toString() || "",
      professorId: currentClass.professorId?.toString() || "",
      date: currentClass.date,
      startTime: currentClass.startTime?.slice(0, 5) || "",
      endTime: currentClass.endTime?.slice(0, 5) || "",
      maxCapacity: currentClass.maxCapacity?.toString() || "",
    },
  });

  const { data: activities = [] } = useQuery({
    queryKey: ["getActivities", tenantId],
    queryFn: () => getActivities(tenantId),
  });

  const { data: professors = [] } = useQuery({
    queryKey: ["getProfessors", tenantId],
    queryFn: () => getProfessors(tenantId),
  });

  const { data: currentStudent } = useQuery({
    queryKey: ["getStudentByUser", tenantId, user?.id],
    queryFn: () => getStudentByUser(tenantId),
    enabled: isStudent && !!user?.id,
  });

  const { data: reservations = [] } = useQuery({
    queryKey: ["getReservationsByStudentId", currentStudent?.id],
    queryFn: () => getReservationsByStudentId(currentStudent.id),
    enabled: !!currentStudent,
  });

  const isFull = currentClass.reservationsCount >= currentClass.maxCapacity;
  const currentReservation = reservations.find(
    (r) => r.classId === currentClass.id,
  );

  const isReserved = !!currentReservation;

  const deleteMutation = useMutation({
    mutationFn: () => deleteClass(currentClass.id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["getClasses", tenantId],
      });

      setConfirmModal(false);
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
      else if (data?.message) msg = data.message;
      setConfirmModal(false);
      setBackendError(msg);
      setErrorModal(true);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (form) =>
      updateClass(currentClass.id, {
        activityId: form.activityId ? Number(form.activityId) : undefined,
        professorId: form.professorId ? Number(form.professorId) : undefined,
        date: form.date || undefined,
        startTime: form.startTime ? `${form.startTime}:00` : undefined,
        endTime: form.endTime ? `${form.endTime}:00` : undefined,
        maxCapacity: form.maxCapacity ? Number(form.maxCapacity) : undefined,
      }),

    onSuccess: (updatedClass) => {
      queryClient.invalidateQueries({
        queryKey: ["getClasses", tenantId],
      });

      setSuccessMessage("Clase actualizada correctamente");
      setSuccessModal(true);

      setCurrentClass(updatedClass);
      setEditing(false);

      setTimeout(() => {
        setSuccessModal(false);
      }, 3000);
    },

    onError: (error) => {
      const data = error?.response?.data;
      let msg = "Ocurrió un error al actualizar la clase";

      if (typeof data === "string") msg = data;
      else if (data?.errors)
        msg = Object.values(data.errors).flat().join(" - ");
      else if (data?.message) msg = data.message;

      setBackendError(msg);
      setErrorModal(true);
    },
  });

  const reservationMutation = useMutation({
    mutationFn: () =>
      createReservation({
        classId: currentClass.id,
        tenantId: tenantId,
        studentId: currentStudent.id,
        reservationDate: new Date().toISOString(),
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["getClasses", tenantId],
      });

      setSuccessMessage("¡Te uniste a la clase correctamente!");
      setSuccessModal(true);

      setTimeout(() => {
        close();
      }, 3000);
    },

    onError: (error) => {
      const data = error?.response?.data;
      let msg = "Ocurrió un error al unirse a la clase";

      if (typeof data === "string") msg = data;
      else if (data?.errors)
        msg = Object.values(data.errors).flat().join(" - ");
      else if (data?.message) msg = data.message;

      setBackendError(msg);
      setErrorModal(true);
    },
  });

  const cancelReservationMutation = useMutation({
    mutationFn: () => deleteReservation(currentReservation.id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["getClasses", tenantId],
      });

      queryClient.invalidateQueries({
        queryKey: ["getReservationsByStudentId", currentStudent.id],
      });

      setSuccessMessage("Saliste de la clase correctamente");
      setSuccessModal(true);

      setTimeout(() => {
        close();
      }, 3000);
    },

    onError: (error) => {
      const data = error?.response?.data;
      let msg = "Ocurrió un error al salir de la clase";

      if (typeof data === "string") msg = data;
      else if (data?.errors)
        msg = Object.values(data.errors).flat().join(" - ");
      else if (data?.message) msg = data.message;

      setBackendError(msg);
      setErrorModal(true);
    },
  });

  const onSubmit = (form) => {
    updateMutation.mutate(form);
  };

  const decreaseReservationCount = () => {
    const updatedClass = {
      ...currentClass,
      reservationsCount: currentClass.reservationsCount - 1,
    };
    setCurrentClass(updatedClass);
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
          <h2 className="text-2xl font-semibold mb-2">
            {currentClass.activity.name}
          </h2>

          <p className="text-gray-600 mb-6">
            {currentClass.professor.user.name}{" "}
            {currentClass.professor.user.surname}
          </p>

          <div className="space-y-4 mb-8">
            <div className="bg-[#efefef] rounded-xl p-4">
              <p className="text-sm text-gray-600 mb-1">Fecha</p>
              <p className="font-semibold text-[#333]">
                {formatDateWithDay(currentClass.date)}
              </p>{" "}
            </div>

            <div className="bg-[#efefef] rounded-xl p-4">
              <p className="text-sm text-gray-600 mb-1">Horario</p>
              <p className="font-semibold text-[#333]">
                {currentClass.startTime.slice(0, 5)} -{" "}
                {currentClass.endTime.slice(0, 5)}
              </p>
            </div>

            <div className="bg-[#efefef] rounded-xl p-4">
              <p className="text-sm text-gray-600 mb-1">Disponibilidad</p>

              <div className="flex justify-between items-center gap-3">
                <p className="font-semibold text-[14px] min-[900px]:text-[16px] text-[#333]">
                  {currentClass.reservationsCount} / {currentClass.maxCapacity}{" "}
                  alumnos
                </p>

                <div className="flex items-center gap-2">
                  {canEdit && (
                    <button
                      onClick={() => setStudentsModal(true)}
                      className="bg-[#333] text-[12px] min-[900px]:text-[16px] text-white px-3 min-[900px]:px-4 py-1.5 rounded-lg text-sm hover:bg-gray-700 transition cursor-pointer"
                    >
                      Ver alumnos
                    </button>
                  )}

                  {isFull && (
                    <span className="bg-red-100 text-red-700 text-xs rounded-full px-2 py-1">
                      Llena
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {canEdit ? (
            <div className="flex justify-end gap-3 max-[360px]:text-[13px]">
              <button
                onClick={() => setConfirmModal(true)}
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
          ) : isStudent ? (
            classStarted ? (
              <div className="w-full py-3 rounded-xl text-center bg-gray-200 text-gray-600 font-semibold">
                No disponible
              </div>
            ) : isReserved ? (
              <button
                onClick={() => cancelReservationMutation.mutate()}
                disabled={cancelReservationMutation.isPending}
                className="w-full py-3 rounded-xl font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 cursor-pointer"
              >
                {cancelReservationMutation.isPending
                  ? "Saliendo..."
                  : "Salir de la clase"}
              </button>
            ) : (
              <button
                onClick={() => reservationMutation.mutate()}
                disabled={
                  isFull || reservationMutation.isPending || !currentStudent
                }
                className={`w-full py-3 rounded-xl font-semibold transition ${
                  isFull
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-[#333] text-white hover:bg-gray-700 cursor-pointer"
                } disabled:opacity-50`}
              >
                {reservationMutation.isPending
                  ? "Procesando..."
                  : isFull
                    ? "Lista de espera"
                    : "Entrar a la clase"}
              </button>
            )
          ) : null}
        </>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <h2 className="text-2xl font-semibold text-center mb-6">
            Editar clase
          </h2>

          <div>
            <label className="block text-sm font-semibold mb-2">
              Actividad
            </label>
            <select
              {...register("activityId")}
              className="w-full border rounded-xl px-3 py-2 bg-[#efefef] focus:outline-none focus:ring-2 focus:ring-[#333]"
            >
              <option value="">Selecciona una actividad</option>
              {activities.map((activity) => (
                <option key={activity.id} value={activity.id}>
                  {activity.name}
                </option>
              ))}
            </select>
            {errors.activityId && (
              <p className="text-red-500 text-[13px] mt-1">
                {errors.activityId.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Profesor</label>
            <select
              {...register("professorId")}
              className="w-full border rounded-xl px-3 py-2 bg-[#efefef] focus:outline-none focus:ring-2 focus:ring-[#333]"
            >
              <option value="">Selecciona un profesor</option>
              {professors.map((professor) => (
                <option key={professor.id} value={professor.id}>
                  {professor.user.name} {professor.user.surname}
                </option>
              ))}
            </select>
            {errors.professorId && (
              <p className="text-red-500 text-[13px] mt-1">
                {errors.professorId.message}
              </p>
            )}
          </div>

          <FormInput
            label="Fecha"
            type="date"
            register={register("date")}
            error={errors.date}
          />

          <FormInput
            label="Hora de inicio"
            type="time"
            register={register("startTime")}
            error={errors.startTime}
          />

          <FormInput
            label="Hora de fin"
            type="time"
            register={register("endTime")}
            error={errors.endTime}
          />

          <FormInput
            label="Capacidad máxima"
            type="number"
            register={register("maxCapacity")}
            error={errors.maxCapacity}
          />

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="border px-4 py-2 rounded-xl"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="bg-[#333] text-white px-4 py-2 rounded-xl hover:bg-gray-700 disabled:opacity-50"
            >
              {updateMutation.isPending ? "Actualizando..." : "Actualizar"}
            </button>
          </div>
        </form>
      )}

      {confirmModal && (
        <ConfirmModal
          title="¿Eliminar esta clase?"
          message={`Estás por eliminar la clase del dia ${formatDateWithDay(currentClass.date)} a las ${currentClass.startTime.slice(0, 5)} - ${currentClass.endTime.slice(0, 5)}.`}
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

      {studentsModal && (
        <ClassStudentsModal
          currentClass={currentClass}
          tenantId={tenantId}
          maxCapacity={currentClass.maxCapacity}
          close={() => setStudentsModal(false)}
          formatDateWithDay={formatDateWithDay}
          decreaseReservationCount={decreaseReservationCount}
        />
      )}
    </Modal>
  );
}
