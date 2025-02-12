import { ShowFilter } from "@/app/types/showtimes/ShowFilter";
import React from "react";

interface ShowFilterSelectorProps {
    showFilters : ShowFilter[];
    selectedShowFilter: ShowFilter | null;
    onFilterChange: (showFilter: ShowFilter) => void;
}

export default function ShowFilterSelector({showFilters, selectedShowFilter, onFilterChange}: ShowFilterSelectorProps) {
    return (
        <div className="overflow-x-auto whitespace-wrap py-4 px-2">
          <div className="inline-flex space-x-4">
            {showFilters.map((showFilter) => (
              <button
                key={showFilter.keyword}
                onClick={() => onFilterChange(showFilter)}
                className={`px-4 py-2 rounded ${
                    selectedShowFilter === showFilter ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
                }`}
              >
                {showFilter.description}
              </button>
            ))}
          </div>
        </div>
    );
}
