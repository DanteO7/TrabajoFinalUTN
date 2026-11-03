import { X } from "lucide-react";
import SearchInput from "../inputs/search-input";

export default function TenantSearchFilter({
  search,
  status,
  onSearchChange,
  onStatusChange,
  t,
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 min-[700px]:flex-row">
      <SearchInput
        value={search}
        onChange={onSearchChange}
        placeholder={t("tenants.searchPlaceholder")}
      />

      <div className="flex items-center gap-2">
        <select
          value={status}
          onChange={(event) => onStatusChange(event.target.value)}
          className="cursor-pointer rounded-lg border border-gray-400 bg-[#f1eef3] px-3 pt-1.75 pb-2 text-gray-600 outline-none transition-[border-color,box-shadow] duration-200 focus:border-transparent focus:ring-[1.5px] focus:ring-[#fc697b]"
          aria-label={t("tenants.statusFilter")}
        >
          <option value="all">{t("tenants.allStatuses")}</option>
          <option value="active">{t("tenants.active")}</option>
          <option value="inactive">{t("tenants.inactive")}</option>
        </select>

        {status !== "all" && (
          <button
            type="button"
            onClick={() => onStatusChange("all")}
            className="cursor-pointer text-gray-400 transition hover:text-black"
            title={t("tenants.clearStatusFilter")}
            aria-label={t("tenants.clearStatusFilter")}
          >
            <X size={18} color="#fc697b" />
          </button>
        )}
      </div>
    </div>
  );
}
