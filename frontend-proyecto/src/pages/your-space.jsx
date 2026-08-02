import React from "react";
import MainLayout from "../layouts/main-layout";
import { useQuery } from "@tanstack/react-query";
import { getMyTenants } from "../services/tenant";
import MyTenantCard from "../components/your-space/my-tenant-card";
import { Link } from "wouter";
import Loading from "../components/loading";
import { useEffect } from "react";
import { useTenantStore } from "../store/tenant-store";

export default function YourSpace() {
  const { data: myTenants, isLoading } = useQuery({
    queryKey: ["myTenants"],
    queryFn: getMyTenants,
  });

  const fetchUserRolesInTenant = useTenantStore(
    (state) => state.fetchUserRolesInTenant,
  );

  useEffect(() => {
    if (myTenants) {
      myTenants.forEach((tenant) => {
        fetchUserRolesInTenant(tenant.id);
      });
    }
  }, [myTenants, fetchUserRolesInTenant]);

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
        {isLoading ? (
          <Loading />
        ) : (
          <div className="grid grid-cols-1 gap-6 justify-center min-[900px]:grid-cols-2 w-full min-[900px]:w-[65%] min-[1350px]:w-[50%]">
            {myTenants?.map((t) => (
              <Link
                className="w-full flex"
                key={t.id}
                href={`tu-espacio/${t.id}`}
              >
                <MyTenantCard myTenant={t} key={t.id} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
