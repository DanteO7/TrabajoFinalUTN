import { X, Pencil } from "lucide-react";
import { useState } from "react";
import Modal from "../modals/modal";
import { useForm } from "react-hook-form";
import FormInput from "../form-input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import SuccessModal from "../modals/success-modal";
import ErrorModal from "../modals/error-modal";
import ConfirmModal from "../modals/confirm-modal";
import RedButton from "../buttons/red-button";
import BlackButton from "../buttons/black-button";
import { Trash2 } from "lucide-react";
import WhiteButton from "../buttons/white-button";
import { deleteNews, updateNews } from "../../services/news";
import { useAuthStore } from "../../store/auth-store";

export default function NewsModal({ news, tenantId, close, canCreateNews }) {
  const { user } = useAuthStore();

  const isAdmin = user?.roles?.includes("Admin");

  const [editing, setEditing] = useState(false);
  const [currentNew, setCurrentNew] = useState(news);

  const [backendError, setBackendError] = useState();
  const [errorModal, setErrorModal] = useState(false);

  const [successMessage, setSuccessMessage] = useState();
  const [successModal, setSuccessModal] = useState(false);

  const [confirmModal, setConfirmModal] = useState(false);

  const queryClient = useQueryClient();

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      title: news.title,
      content: news.content,
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteNews(currentNew.id, news.tenantId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["news", tenantId],
      });

      setConfirmModal(false);

      setSuccessMessage("Noticia eliminada correctamente");
      setSuccessModal(true);

      setTimeout(() => {
        close();
      }, 3000);
    },

    onError: (error) => {
      setConfirmModal(false);
      const data = error?.response?.data;

      let msg = "Ocurrió un error al eliminar la noticia";

      if (typeof data === "string") msg = data;
      else if (data?.errors)
        msg = Object.values(data.errors).flat().join(" - ");
      else if (data?.title) msg = data.title;

      setBackendError(msg);
      setErrorModal(true);
    },
  });

  const mutation = useMutation({
    mutationFn: (data) => updateNews(currentNew.id, data),

    onSuccess: (updatedNews) => {
      queryClient.invalidateQueries({
        queryKey: ["news", tenantId],
      });

      setSuccessMessage("Noticia actualizada correctamente");
      setSuccessModal(true);

      setCurrentNew(updatedNews);

      reset(updatedNews);

      setEditing(false);

      setTimeout(() => {
        setSuccessModal(false);
      }, 3000);
    },

    onError: (error) => {
      const data = error?.response?.data;

      let msg = "Ocurrió un error al actualizar la noticia";

      if (typeof data === "string") msg = data;
      else if (data?.errors)
        msg = Object.values(data.errors).flat().join(" - ");
      else if (data?.title) msg = data.title;

      setBackendError(msg);
      setErrorModal(true);
    },
  });

  const onSubmit = (form) => {
    const data = {
      ...form,
      tenantId: news.tenantId,
    };
    mutation.mutate(data);
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
          <h2 className="text-2xl font-semibold mb-5">{currentNew.title}</h2>
          <p className="text-gray-600 whitespace-pre-wrap">
            {currentNew.content}
          </p>

          {(isAdmin || (canCreateNews && news.tenantId != null)) && (
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
          )}
        </>
      ) : (
        <>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <h2 className="text-2xl font-semibold text-center">Editar</h2>

            <FormInput label="Titulo" register={register("title")} />

            <div>
              <label className="block mb-2">Contenido</label>

              <textarea
                rows={4}
                {...register("content")}
                className="w-full rounded-xl bg-[#efefef] border px-3 py-2 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <WhiteButton
                text="Cancelar"
                onClick={() => {
                  reset();
                  setEditing(false);
                }}
                textSmall={true}
              />
              <BlackButton
                text={mutation.isPending ? "Actualizando..." : "Actualizar"}
                type="submit"
                disabled={mutation.isPending}
                textSmall={true}
              />
            </div>
          </form>
        </>
      )}

      {confirmModal && (
        <ConfirmModal
          title="¿Eliminar esta profesión?"
          message={`Estás por eliminar la profesion "${news.name}". Esta acción no se puede deshacer.`}
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
