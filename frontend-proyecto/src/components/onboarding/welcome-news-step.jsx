import { useState } from "react";
import Loading from "../loading";
import BlackButton from "../buttons/black-button";
import NewsForm from "../news/news-form";
import {
  getWelcomeNewsContent,
  getWelcomeNewsTitle,
} from "./welcome-news-content";

export default function WelcomeNewsStep({
  tenantId,
  tenantName,
  isLoading,
  isError,
  isComplete,
  onRetry,
  onCreated,
}) {
  const [openForm, setOpenForm] = useState(false);

  if (isLoading) {
    return <Loading />;
  }

  if (isError || !tenantName) {
    return (
      <div className="mt-6">
        <p className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">
          No se pudieron cargar los datos para preparar la noticia. Intentá
          nuevamente.
        </p>
        <button type="button" onClick={onRetry} className="mt-3 underline">
          Reintentar
        </button>
      </div>
    );
  }

  const welcomeTitle = getWelcomeNewsTitle(tenantName);
  const welcomeContent = getWelcomeNewsContent(tenantName);

  return (
    <div className="mt-6 flex flex-col gap-5">
      <p className="text-gray-600">
        {isComplete
          ? "¡Listo! La noticia de bienvenida ya está publicada y tus alumnos podrán verla."
          : "Prepará una noticia de bienvenida para que tus alumnos conozcan la comunidad y sepan dónde encontrar las novedades del negocio."}
      </p>

      {!isComplete && (
        <BlackButton
          text="Crear noticia de bienvenida"
          onClick={() => setOpenForm(true)}
          wfit
          textSmall
        />
      )}

      {openForm && (
        <NewsForm
          tenantId={tenantId}
          close={() => setOpenForm(false)}
          initialTitle={welcomeTitle}
          initialContent={welcomeContent}
          tenantOnly
          onCreated={onCreated}
        />
      )}
    </div>
  );
}
