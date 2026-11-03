export default function TenantItem({ tenant, onSelect, t }) {
  const ownerName = [tenant.ownerUser?.name, tenant.ownerUser?.surname]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      onClick={() => onSelect(tenant)}
      className="w-full min-w-0 max-w-full cursor-pointer rounded-lg border border-gray-400 bg-[#efecf0] p-5 text-left shadow-md transition] duration-300 hover:-translate-y-1 hover:shadow-xl min-[500px]:p-5"
    >
      <div className="flex min-w-0 items-start justify-between gap-2 min-[500px]:gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="break-words text-lg font-semibold min-[500px]:text-xl">
            {tenant.name}
          </h3>
          <p className="break-words text-sm text-gray-500 min-[500px]:text-base">
            {ownerName || tenant.ownerUser?.email}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold min-[500px]:px-3 min-[500px]:text-xs ${
            tenant.isActive
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {tenant.isActive ? t("tenants.active") : t("tenants.inactive")}
        </span>
      </div>
      <p className="mt-2 break-words text-sm text-gray-500 min-[500px]:mt-3 min-[500px]:text-base">
        {tenant.ownerUser?.email || t("tenants.ownerUnavailable")}
      </p>
      <p className="mt-1 break-words text-sm text-gray-500 min-[500px]:text-base">
        {tenant.tenantPlan?.name || t("tenants.planUnavailable")}
      </p>
    </button>
  );
}
