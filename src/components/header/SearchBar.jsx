import React, { useState } from "react";
import { Search } from "lucide-react";

export default function SearchBar({ placeholder = "Search candidates..." }) {
  const [searchValue, setSearchValue] = useState("");

  return (
    <div className="flex-1 max-w-2xl mx-6">
      <div className="relative group">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#27592D] transition-colors duration-200" />
        <input
          type="text"
          placeholder={placeholder}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="w-full pl-11 pr-4 py-2 text-sm rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 shadow-md focus:outline-none focus:ring-2 focus:ring-[#27592D]/30 focus:border-[#27592D] focus:shadow-lg transition-all duration-200 hover:shadow-lg"
        />
      </div>
    </div>
  );
}

