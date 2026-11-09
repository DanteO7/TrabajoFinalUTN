import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useUserFilterStore } from "../../store/user-filter-store";
import SearchInput from "../inputs/search-input";
import { useTranslation } from "react-i18next";

export default function UserSearchFilters() {
  const { t } = useTranslation();
  const { search, role, setFilters } = useUserFilterStore();
  const [inputValue, setInputValue] = useState(search || "");

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters({
        search: inputValue.trim() || undefined,
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [inputValue, setFilters]);

  return (
    <div className="flex flex-col min-[700px]:flex-row gap-3 mb-6">
      <SearchInput
        value={inputValue}
        onChange={setInputValue}
        placeholder={t("users.searchPlaceholder")}
      />

      <div className="flex items-center gap-2 ">
        <select
          value={role || ""}
          onChange={(e) =>
            setFilters({
              role: e.target.value || undefined,
            })
          }
          className="rounded-lg px-3 pt-1.75 pb-2 text-gray-600 cursor-pointer bg-[#f1eef3] border border-gray-400 outline-none focus:ring-[1.5px] focus:ring-[#fc697b] focus:border-transparent transition-[border-color,box-shadow] duration-200"
        >
          <option value="">{t("users.allRoles")}</option>
          <option value="Admin">{t("users.roles.admin")}</option>
          <option value="Tenant">{t("users.roles.owner")}</option>
          <option value="Professor">{t("users.roles.professor")}</option>
          <option value="Student">{t("users.roles.student")}</option>
        </select>

        {role && (
          <button
            type="button"
            onClick={() => setFilters({ role: undefined })}
            className="text-gray-400 hover:text-black transition cursor-pointer"
            title={t("users.clearRoleFilter")}
          >
            <X size={18} color="#fc697b" />
          </button>
        )}
      </div>
    </div>
  );
}
