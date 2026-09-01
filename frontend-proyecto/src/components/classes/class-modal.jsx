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
import {
  createWaitlist,
  deleteWaitlist,
  getWaitlistByStudentId,
} from "../../services/waitlist";
import WhiteButton from "../buttons/white-button";
import BlackButton from "../buttons/black-button";
import RedButton from "../buttons/red-button";
import { Trash2 } from "lucide-react";

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

  const { data: waitlists = [] } = useQuery({
    queryKey: ["getWaitlistByStudentId", currentStudent?.id],
    queryFn: () => getWaitlistByStudentId(currentStudent.id),
    enabled: !!currentStudent,
  });

  const currentWaitlist = waitlists.find((w) => w.classId === currentClass.id);

  const isInWaitlist = !!currentWaitlist;

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
      }, 2000);
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
      }, 2000);
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
        studentIds: [currentStudent.id],
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["getClasses", tenantId],
      });

      setSuccessMessage("¡Te uniste a la clase correctamente!");
      setSuccessModal(true);

      setTimeout(() => {
        close();
      }, 2000);
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

  const waitlistMutation = useMutation({
    mutationFn: () =>
      createWaitlist({
        classId: currentClass.id,
        studentId: currentStudent.id,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["getWaitlistByStudentId", currentStudent.id],
      });

      setSuccessMessage("Te agregaste a la lista de espera correctamente.");
      setSuccessModal(true);

      setTimeout(() => {
        setSuccessModal(false);
      }, 2000);
    },

    onError: (error) => {
      const data = error?.response?.data;
      let msg = "Ocurrió un error al entrar a la lista de espera";

      if (typeof data === "string") msg = data;
      else if (data?.errors)
        msg = Object.values(data.errors).flat().join(" - ");
      else if (data?.message) msg = data.message;

      setBackendError(msg);
      setErrorModal(true);
    },
  });

  const deleteWaitlistMutation = useMutation({
    mutationFn: () => deleteWaitlist(currentWaitlist.id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["getWaitlistByStudentId", currentStudent.id],
      });

      setSuccessMessage("Saliste de la lista de espera correctamente.");
      setSuccessModal(true);

      setTimeout(() => {
        setSuccessModal(false);
      }, 2000);
    },

    onError: (error) => {
      const data = error?.response?.data;
      let msg = "Ocurrió un error al salir de la lista de espera";

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
      }, 2000);
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

  const decreaseReservationCount = (quantity) => {
    const updatedClass = {
      ...currentClass,
      reservationsCount: currentClass.reservationsCount - quantity,
    };
    setCurrentClass(updatedClass);
  };
  const increaseReservationCount = (quantity) => {
    const updatedClass = {
      ...currentClass,
      reservationsCount: currentClass.reservationsCount + quantity,
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
            {currentClass.activityName}
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
              </p>
            </div>

            <div className="bg-[#efefef] rounded-xl p-4">
              <p className="text-sm text-gray-600 mb-1">Horario</p>
              <p className="font-semibold text-[#333]">
                {currentClass.startTime.slice(0, 5)} -{" "}
                {currentClass.endTime.slice(0, 5)}
              </p>
            </div>

            <div
              className={`bg-[#efefef] rounded-xl p-4 ${isFull && "bg-red-100"}`}
            >
              <p className="text-sm text-gray-600 mb-1">
                {isFull ? "Lleno" : "Disponibilidad"}
              </p>

              <div className="flex justify-between items-center gap-3">
                <p className="font-semibold text-[14px] min-[900px]:text-[16px] text-[#333]">
                  {currentClass.reservationsCount} / {currentClass.maxCapacity}{" "}
                  alumnos
                </p>

                <div className="flex items-center gap-2">
                  {canEdit && (
                    <button
                      onClick={() => setStudentsModal(true)}
                      className="bg-[#333] text-[12px] min-[900px]:text-[16px] text-white px-3 min-[900px]:px-4 py-1.5 rounded-lg text-sm hover:bg-[#222] transition cursor-pointer"
                    >
                      Ver alumnos
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {canEdit ? (
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
                onClick={() => setEditing(true)}
                textSmall={true}
                img={<Pencil size={18} />}
              />
            </div>
          ) : isStudent ? (
            classStarted ? (
              <div className="w-full py-3 rounded-xl text-center bg-gray-200 text-gray-600 font-semibold">
                No disponible
              </div>
            ) : isReserved ? (
              <div className="flex gap-3">
                <WhiteButton
                  type="button"
                  text="Cancelar"
                  onClick={close}
                  textSmall={true}
                />
                <RedButton
                  onClick={() => cancelReservationMutation.mutate()}
                  disabled={cancelReservationMutation.isPending}
                  text={
                    cancelReservationMutation.isPending
                      ? "Saliendo..."
                      : "Salir de la clase"
                  }
                  textSmall={true}
                />
              </div>
            ) : isInWaitlist ? (
              <RedButton
                text={
                  deleteWaitlistMutation.isPending
                    ? "Saliendo..."
                    : "Salir de lista de espera"
                }
                textSmall={true}
                onClick={() => deleteWaitlistMutation.mutate()}
                disabled={deleteWaitlistMutation.isPending}
              />
            ) : isFull ? (
              <BlackButton
                text={
                  waitlistMutation.isPending
                    ? "Agregando..."
                    : "Entrar en lista de espera"
                }
                textSmall={true}
                onClick={() => waitlistMutation.mutate()}
                disabled={waitlistMutation.isPending || !currentStudent}
              />
            ) : (
              <div className="flex gap-3">
                <WhiteButton
                  type="button"
                  text="Cancelar"
                  onClick={close}
                  textSmall={true}
                />
                <BlackButton
                  onClick={() => reservationMutation.mutate()}
                  disabled={reservationMutation.isPending || !currentStudent}
                  text={
                    reservationMutation.isPending
                      ? "Procesando..."
                      : "Entrar a la clase"
                  }
                  textSmall={true}
                />
              </div>
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
          <div className="grid grid-cols-2 gap-3">
            <WhiteButton
              type="button"
              text="Cancelar"
              onClick={() => setEditing(false)}
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
          increaseReservationCount={increaseReservationCount}
        />
      )}
    </Modal>
  );
}
