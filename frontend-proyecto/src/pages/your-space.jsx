import MainLayout from "../layouts/main-layout";
import { useQuery } from "@tanstack/react-query";
import { getMyTenants } from "../services/tenant";
import MyTenantCard from "../components/your-space/my-tenant-card";
import { Link } from "wouter";
import Loading from "../components/loading";
import { useState, Fragment } from "react";
import ToggleInput from "../components/toggle-input";
import ErrorModal from "../components/modals/error-modal";

export default function YourSpace() {
  const [openInactiveModal, setOpenInactiveModal] = useState(false);
  const [showInactive, setShowInactive] = useState(false);

  const { data: myTenants, isLoading } = useQuery({
    queryKey: ["myTenants"],
    queryFn: () => getMyTenants(false),
  });

  return (
    <MainLayout>
      <div className="w-full mt-10 flex flex-col gap-7 items-center lg:gap-10 lg:mt-15">
        <div className="text-center">
          <h2 className="font-semibold text-2xl mb-3 lg:text-4xl lg:mb-5">
            Tu espacio
          </h2>

          <p>
            Acá podés encontrar todos tus espacios. Visualizá los negocios que
            administrás y aquellos a los que fuiste invitado.
          </p>
        </div>

        {myTenants?.some((t) => t.isActive === false) && (
          <ToggleInput
            state={showInactive}
            setState={setShowInactive}
            text="Mostrar inactivos:"
            gap={4}
          />
        )}

        {isLoading ? (
          <Loading />
        ) : (
          <div className="grid grid-cols-1 gap-6 justify-center min-[900px]:grid-cols-2 w-full min-[900px]:w-[65%] min-[1350px]:w-[50%]">
            {myTenants
              ?.filter((t) => t.isActive || showInactive)
              .map((t) => (
                <Fragment key={t.id}>
                  {t.isActive ? (
                    <Link className="w-full flex" href={`tu-espacio/${t.id}`}>
                      <MyTenantCard myTenant={t} />
                    </Link>
                  ) : (
                    <div
                      onClick={() => setOpenInactiveModal(true)}
                      className="cursor-pointer"
                    >
                      <MyTenantCard myTenant={t} />
                    </div>
                  )}
                </Fragment>
              ))}
          </div>
        )}
      </div>

      {openInactiveModal && (
        <ErrorModal
          close={() => setOpenInactiveModal(false)}
          message="Este negocio está inactivo, por favor hable con el dueño o renueve su cuota para activarlo"
          isSuccesOrError
        />
      )}
    </MainLayout>
  );
}
