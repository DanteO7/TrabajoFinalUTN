import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Modal from "../modals/modal";
import FormInput from "../form-input";
import SuccessModal from "../modals/success-modal";
import ErrorModal from "../modals/error-modal";
import { createClassSchema } from "../../schema/class-schema";
import { createClass } from "../../services/class";
import { getActivities } from "../../services/activity";
import { getProfessors } from "../../services/professor";
import BlackButton from "../buttons/black-button";
import WhiteButton from "../buttons/white-button";

export default function ClassForm({ tenantId, defaultDate, close }) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createClassSchema),
    mode: "onTouched",
    defaultValues: {
      date: defaultDate || "",
    },
  });

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

  const mutation = useMutation({
    mutationFn: createClass,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["getClasses", tenantId],
      });

      setSuccessMessage("Clase creada correctamente");
      setSuccessModal(true);

      setTimeout(() => {
        close();
      }, 3000);
    },

    onError: (error) => {
      const data = error?.response?.data;

      let msg = "Ocurrió un error al crear la clase";

      if (typeof data === "string") msg = data;
      else if (data?.errors)
        msg = Object.values(data.errors).flat().join(" - ");
      else if (data?.title) msg = data.title;

      setBackendError(msg);
      setErrorModal(true);
    },
  });

  const onSubmit = (form) => {
    mutation.mutate({
      activityId: Number(form.activityId),
      professorId: Number(form.professorId),
      tenantId,
      date: form.date,
      startTime: `${form.startTime}:00`,
      endTime: `${form.endTime}:00`,
      maxCapacity: Number(form.maxCapacity),
    });
  };

  return (
    <Modal open onClose={close}>
      <button
        onClick={close}
        className="absolute top-4 right-4 text-gray-500 hover:text-black cursor-pointer"
      >
        <X size={20} />
      </button>

      <h2 className="text-2xl font-semibold text-center mb-6">Crear clase</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <label className="block mb-2">Actividad</label>

          <select
            {...register("activityId")}
            className="w-full rounded-xl border bg-[#efefef] px-3 py-2"
          >
            <option value="">Seleccionar</option>

            {activities.map((activity) => (
              <option key={activity.id} value={activity.id}>
                {activity.name}
              </option>
            ))}
          </select>

          {errors.activityId && (
            <p className="text-red-500 text-sm mt-1">
              {errors.activityId.message}
            </p>
          )}
        </div>

        <div>
          <label className="block mb-2">Profesor</label>

          <select
            {...register("professorId")}
            className="w-full rounded-xl border bg-[#efefef] px-3 py-2"
          >
            <option value="">Seleccionar</option>

            {professors.map((professor) => (
              <option key={professor.id} value={professor.id}>
                {professor.user.name} {professor.user.surname}
              </option>
            ))}
          </select>

          {errors.professorId && (
            <p className="text-red-500 text-sm mt-1">
              {errors.professorId.message}
            </p>
          )}
        </div>

        <FormInput
          type="date"
          label="Fecha"
          register={register("date")}
          error={errors.date}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormInput
            type="time"
            label="Hora inicio"
            register={register("startTime")}
            error={errors.startTime}
          />

          <FormInput
            type="time"
            label="Hora fin"
            register={register("endTime")}
            error={errors.endTime}
          />
        </div>

        <FormInput
          type="number"
          label="Capacidad máxima"
          register={register("maxCapacity")}
          error={errors.maxCapacity}
        />
        <div className="grid grid-cols-2 gap-3">
          <WhiteButton text="Cancelar" onClick={close} textSmall={true} />

          <BlackButton text="Crear clase" type="submit" textSmall={true} />
        </div>
      </form>

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
    </Modal>
  );
}
