import { ShowFilter } from "@/app/types/showtimes/ShowFilter";
import React from "react";

interface ShowFilterSelectorProps {
  showFilters : ShowFilter[];
  selectedShowFilter: ShowFilter | null;
  onFilterChange: (showFilter: ShowFilter) => void;
}

const ShowFilterSelector = React.memo(({ showFilters, selectedShowFilter, onFilterChange }: ShowFilterSelectorProps) => {
  return (
    <div className="overflow-x-auto whitespace-wrap py-4 px-2">
      <div className="inline-flex space-x-4">
        {showFilters.map((showFilter: ShowFilter, index: number) => (
          <button
            key={`${showFilter.Keyword || 'undefined'}-${showFilter.Category || 'undefined'}-${index}`}
            onClick={() => onFilterChange(showFilter)}
            className={`px-4 py-2 rounded ${selectedShowFilter?.Keyword === showFilter.Keyword && selectedShowFilter?.Category === showFilter.Category ? "bg-blue-500 text-white" : "bg-gray-200 text-black"}`}
          >
            {showFilter.Description}
          </button>
        ))}
      </div>
    </div>
  );
});

// ✅ Explicitly set displayName to pass ESLint
ShowFilterSelector.displayName = "ShowFilterSelector";

export default ShowFilterSelector;
