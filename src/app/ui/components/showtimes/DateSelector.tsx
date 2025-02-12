import React from "react";

interface DateSelectorProps {
    dates: string[];
    selectedDate: string | null;
    onDateChange: (date: string) => void;
}

export default function DateSelector({dates, selectedDate, onDateChange}: DateSelectorProps) {
    return (
        <div className="overflow-x-auto whitespace-wrap py-4 px-2">
          <div className="inline-flex space-x-4">
            {dates.map((date) => (
              <button
                key={date}
                onClick={() => onDateChange(date)}
                className={`px-4 py-2 rounded ${
                  selectedDate === date ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
                }`}
              >
                {new Date(date).toDateString()}
              </button>
            ))}
          </div>
        </div>
    );
}
