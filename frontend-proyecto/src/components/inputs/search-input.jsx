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
        className="w-full text-gray-600 rounded-lg px-10 py-1.75 bg-[#f1eef3] border border-gray-300 outline-none focus:ring-[1.5px] focus:ring-[#fc697b] focus:border-transparent transition-all duration-200"
      />

      {value && (
        <X
          size={18}
          color="#fc697b"
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
        />
      )}
    </div>
  );
}
