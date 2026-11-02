import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { IoArrowBack } from "react-icons/io5";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";

import MainLayout from "../layouts/main-layout";
import Loading from "../components/loading";
import TenantItem from "../components/tenant/tenant-item";
import TenantModal from "../components/tenant/tenant-modal";
import TenantSearchFilter from "../components/tenant/tenant-search-filter";
import { getTenants } from "../services/tenant";

export default function Tenants() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const {
    data: tenants = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["tenants"],
    queryFn: getTenants,
  });

  const filteredTenants = useMemo(() => {
    const normalizedSearch = search.toLocaleLowerCase();

    return tenants.filter((tenant) => {
      const ownerName = [
        tenant.ownerUser?.name,
        tenant.ownerUser?.surname,
        tenant.ownerUser?.email,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase();
      const matchesSearch = [
        tenant.name,
        tenant.address,
        ownerName,
        tenant.tenantPlan?.name,
      ]
        .filter(Boolean)
        .some((value) => value.toLocaleLowerCase().includes(normalizedSearch));
      const matchesStatus =
        status === "all" ||
        (status === "active" ? tenant.isActive : !tenant.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [search, status, tenants]);

  const errorMessage =
    typeof error?.response?.data === "string"
      ? error.response.data
      : error?.response?.data?.message ||
        error?.response?.data?.title ||
        t("tenants.listError");

  return (
    <MainLayout>
      <div className="mt-12 w-full max-w-6xl">
        <button
          type="button"
          onClick={() => setLocation("/")}
          className="mb-6 flex cursor-pointer items-center gap-2 text-gray-500 transition hover:text-black"
        >
          <IoArrowBack color="#fc697b" />
          {t("tenants.back")}
        </button>
        <h1 className="mb-2 text-4xl font-bold min-[900px]:text-5xl">
          {t("tenants.title")}
        </h1>
        <p className="mb-6 text-gray-500">{t("tenants.subtitle")}</p>

        <TenantSearchFilter
          search={search}
          status={status}
          onSearchChange={setSearch}
          onStatusChange={setStatus}
          t={t}
        />

        {isLoading ? (
          <Loading />
        ) : isError ? (
          <div className="rounded-lg border border-red-300 bg-red-50 p-5 text-red-700">
            <p>{errorMessage}</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-3 cursor-pointer font-semibold underline"
            >
              {t("tenants.retry")}
            </button>
          </div>
        ) : filteredTenants.length > 0 ? (
          <div className="mt-6 grid min-w-0 grid-cols-1 gap-4 min-[900px]:grid-cols-2">
            {filteredTenants.map((tenant) => (
              <TenantItem
                key={tenant.id}
                tenant={tenant}
                onSelect={setSelectedTenant}
                t={t}
              />
            ))}
          </div>
        ) : (
          <p className="mt-6 text-gray-500">{t("tenants.noResults")}</p>
        )}
      </div>

      {selectedTenant && (
        <TenantModal
          key={selectedTenant.id}
          tenant={selectedTenant}
          onTenantUpdated={setSelectedTenant}
          close={() => setSelectedTenant(null)}
        />
      )}
    </MainLayout>
  );
}
