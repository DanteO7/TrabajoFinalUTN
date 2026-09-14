import { useLocation } from "wouter";
import MainLayout from "../layouts/main-layout";
import RedButton from "../components/buttons/red-button";
import ColorButton from "../components/buttons/color-button";

export default function MercadoPagoResult() {
  const [, navigate] = useLocation();

  const params = new URLSearchParams(window.location.search);

  const connected = params.get("connected") === "true";
  const tenantId = params.get("tenantId");

  return (
    <MainLayout>
      {connected ? (
        <div className="border mt-12 p-4 rounded-xl flex flex-col gap-2 shadow-md max-w-100 min-[900px]:p-5 min-[900px]:gap-5">
          <h1 className="font-semibold text-[19px] text-[#1fc762] min-[900px]:text-2xl">
            ¡Mercado Pago conectado correctamente!
          </h1>
          <p>Tu cuenta de Mercado Pago fue vinculada correctamente.</p>
          <ColorButton
            text="Volver a pagos"
            textSmall
            onClick={() => navigate(`/tu-espacio/${tenantId}/pagos`)}
            bgColor="#1fc762"
            textColor="#efefef"
            hoverColor="#18b356"
            disabledColor="#6dda98"
          />
        </div>
      ) : (
        <div className="border mt-12 p-4 rounded-xl flex flex-col gap-2 shadow-md max-w-100 min-[900px]:p-5 min-[900px]:gap-5">
          <h1 className="font-semibold text-[19px] text-[#fc697b] min-[900px]:text-2xl">
            No se pudo conectar con Mercado Pago
          </h1>

          <p>Ocurrió un error al intentar vincular tu cuenta.</p>

          <RedButton
            text="Volver a pagos"
            textSmall
            onClick={() => navigate(`/tu-espacio/${tenantId}/pagos`)}
          />
        </div>
      )}
    </MainLayout>
  );
}
