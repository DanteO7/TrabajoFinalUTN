import { Search, X } from "lucide-react";

export default function SearchInput({
  value,
  onChange,
  placeholder = "Buscar...",
  className = "",
}) {
  return (
    <div className={`relative w-full sm:max-w-md ${className}`}>
      <Search
        size={18}
        color="#fc697b"
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
      />

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border px-10 py-2 bg-[#efefef] outline-none focus:ring-2 focus:ring-[#333]"
      />

      {value && (
        <X
          size={18}
          color="#fc697b"
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black cursor-pointer"
        />
      )}
    </div>
  );
}
