import MainLayout from "../layouts/main-layout";
import { useQuery } from "@tanstack/react-query";
import { getMyTenants } from "../services/tenant";
import MyTenantCard from "../components/your-space/my-tenant-card";
import { Link } from "wouter";
import Loading from "../components/loading";
import { useState, Fragment } from "react";
import ToggleInput from "../components/toggle-input";
import ErrorModal from "../components/modals/error-modal";
import BlackButton from "../components/buttons/black-button";
import { useAuthStore } from "../store/auth-store";
import { useTranslation } from "react-i18next";

export default function YourSpace() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthStore();

  const [openInactiveModal, setOpenInactiveModal] = useState(false);
  const [openInactiveProfessorModal, setOpenInactiveProfessorModal] =
    useState(false);

  const [showInactive, setShowInactive] = useState(false);

  const { data: myTenants, isLoading } = useQuery({
    queryKey: ["myTenants"],
    queryFn: () => getMyTenants(false),
  });

  return (
    <MainLayout>
      <div className="w-full mt-10 flex flex-col items-center gap-7 lg:gap-10 lg:mt-15">
        <div className="text-center">
          <h2 className="font-semibold text-2xl mb-3 lg:text-4xl lg:mb-5">
            {t("yourSpace.title")}
          </h2>

          <p>
            {t("yourSpace.intro")}
          </p>
        </div>
        {!isAuthenticated ? (
          <div className="flex flex-col gap-3 w-[90%] max-w-202.25">
            <span>{t("profile.signInRequired")}</span>
            <Link href="/iniciar-sesion">
              <BlackButton text={t("auth.signIn")} wfit textSmall />
            </Link>
          </div>
        ) : (
          <>
            {myTenants?.some((t) => t.isActive === false) && (
              <ToggleInput
                state={showInactive}
                setState={setShowInactive}
                text={t("yourSpace.showInactive")}
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
                        t.role === "Professor" &&
                        t.isProfessorActive === false ? (
                          <div
                            onClick={() => setOpenInactiveProfessorModal(true)}
                            className="cursor-pointer"
                          >
                            <MyTenantCard myTenant={t} />
                          </div>
                        ) : (
                          <Link
                            className="w-full flex"
                            href={`mi-espacio/${t.id}`}
                          >
                            <MyTenantCard myTenant={t} />
                          </Link>
                        )
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
          </>
        )}
      </div>

      {openInactiveModal && (
        <ErrorModal
          close={() => setOpenInactiveModal(false)}
          message={t("yourSpace.inactiveBusiness")}
          isSuccesOrError
        />
      )}
      {openInactiveProfessorModal && (
        <ErrorModal
          close={() => setOpenInactiveProfessorModal(false)}
          message={t("yourSpace.inactiveProfessor")}
          isSuccesOrError
        />
      )}
    </MainLayout>
  );
}
