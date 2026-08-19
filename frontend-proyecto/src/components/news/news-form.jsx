import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import FormInput from "../form-input";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ErrorModal from "../modals/error-modal";
import Modal from "../modals/modal";
import SuccessModal from "../modals/success-modal";
import WhiteButton from "../buttons/white-button";
import BlackButton from "../buttons/black-button";
import { createNews } from "../../services/news";
import { useAuthStore } from "../../store/auth-store";
import { createNewsSchema } from "../../schema/news-schema";

export default function NewsForm({ tenantId, close }) {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const isAdmin = user?.roles?.includes("Admin");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createNewsSchema),
    mode: "onTouched",
  });

  const [backendError, setBackendError] = useState();
  const [errorModal, setErrorModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState();
  const [successModal, setSuccessModal] = useState(false);

  const mutation = useMutation({
    mutationKey: ["createNews"],
    mutationFn: createNews,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["news", tenantId],
      });

      setSuccessMessage("Noticia creada correctamente");
      setSuccessModal(true);
      setBackendError(null);

      setTimeout(() => {
        close();
      }, 3000);
    },

    onError: (error) => {
      const data = error?.response?.data;

      let msg = "Ocurrió un error al crear la noticia";

      if (typeof data === "string") msg = data;
      else if (data?.errors)
        msg = Object.values(data.errors).flat().join(" - ");
      else if (data?.title) msg = data.title;

      setBackendError(msg);
      setErrorModal(true);
    },
  });

  const onSubmit = (form) => {
    const tenantIdValue = isAdmin ? form.tenantId : "tenant";
    console.log({
      title: form.title,
      content: form.content,
      tenantId: tenantIdValue === "global" ? null : tenantId,
    });

    mutation.mutate({
      title: form.title,
      content: form.content,
      tenantId: tenantIdValue === "global" ? null : tenantId,
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

      <h2 className="text-2xl font-semibold mb-4 text-center">
        Crear una noticia
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormInput
          label="Título de la noticia"
          placeholder="Ej: Nuevas actividades, Nuevo plan, etc."
          register={register("title")}
          error={errors.title}
        />

        <div>
          <label className="block mb-2">Contenido</label>

          <textarea
            placeholder="Explicación de la noticia"
            rows={4}
            {...register("content")}
            className={`w-full rounded-[13px] px-3 py-2 border ${errors.content ? "border-red-500" : "border-gray-300"}  bg-[#efefef] resize-none focus:outline-none focus:ring-2 focus:ring-[#333]`}
          />

          {errors.content && (
            <p className="text-red-500 text-[13px] mt-1">
              {errors.content.message}
            </p>
          )}
        </div>
        {isAdmin && (
          <select {...register("tenantId")} className="...">
            <option value="global">Global</option>
            <option value="tenant">Este negocio</option>
          </select>
        )}

        <div className="grid grid-cols-2 gap-3">
          <WhiteButton text="Cancelar" onClick={close} textSmall={true} />
          <BlackButton
            text={mutation.isPending ? "Creando..." : "Crear noticia"}
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
    </Modal>
  );
}
