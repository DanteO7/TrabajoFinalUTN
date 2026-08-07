import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useUserFilterStore } from "../../store/user-filter-store";

export default function UserSearchFilters() {
  const { search, role, setFilters, clearFilters } = useUserFilterStore();
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
    <div className="flex flex-wrap gap-3 mb-6">
      <div className="relative flex-1 min-w-62.5">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Buscar usuario..."
          className="w-full rounded-xl bg-[#efefef] border px-10 py-2 outline-none focus:ring-2 focus:ring-[#333]"
        />

        {inputValue && (
          <X
            size={18}
            onClick={() => setInputValue("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black cursor-pointer"
          />
        )}
      </div>

      <select
        value={role || ""}
        onChange={(e) =>
          setFilters({
            role: e.target.value || undefined,
          })
        }
        className="rounded-xl bg-[#efefef] border px-3 py-2 outline-none focus:ring-2 focus:ring-[#333]"
      >
        <option value="">Todos</option>
        <option value="Admin">Administrador</option>
        <option value="Tenant">Dueño</option>
        <option value="Professor">Profesor</option>
        <option value="Student">Alumno</option>
      </select>

      {(search || role) && (
        <button
          onClick={clearFilters}
          className="text-gray-500 hover:text-black underline text-sm cursor-pointer"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
}
