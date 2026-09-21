import Footer from "../components/footer";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMyTenants } from "../services/tenant";
import { useTenantStore } from "../store/tenant-store";

export default function MainLayout({ children }) {
  const fetchUserPermissionsInTenant = useTenantStore(
    (state) => state.fetchUserPermissionsInTenant,
  );

  const { data: myTenants } = useQuery({
    queryKey: ["myTenants"],
    queryFn: () => getMyTenants(false),
  });

  useEffect(() => {
    if (!myTenants) return;
    myTenants.forEach((tenant) => {
      fetchUserPermissionsInTenant(tenant.id);
    });
  }, [myTenants, fetchUserPermissionsInTenant]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="min-h-screen flex flex-col text-[#333] dark:text-[#efefef] bg-[#ede9ee] dark:bg-gray-700">
      <main className="flex-1 flex flex-col items-center gap-26 pb-17 px-5">
        {children}
      </main>
      <Footer />
    </div>
  );
}
