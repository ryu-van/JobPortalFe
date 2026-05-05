import React, { useState } from "react";
import { Search } from "lucide-react";

export default function SearchBar({ placeholder = "Tìm kiếm ứng viên..." }) {
  const [searchValue, setSearchValue] = useState("");

  return (
    <div className="flex-1">
      <div className="relative group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand/40 group-focus-within:text-brand transition-colors duration-200" />
        <input
          type="text"
          placeholder={placeholder}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="vw-input !pl-14 !h-11 !min-h-[44px] !bg-brand/5 border-transparent focus:!bg-white"
        />
      </div>
    </div>
  );
}

