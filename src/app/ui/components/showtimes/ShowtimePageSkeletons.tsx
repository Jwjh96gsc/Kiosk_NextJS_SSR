import React from "react";

const ShowtimePageSkeletons = () => {
  return (
    <div className="animate-pulse">
      <h1 className="text-2xl bg-gray-300 h-8 w-1/3 mb-4 rounded"></h1>
      
      {/* Error message placeholder */}
      <div className="bg-gray-300 h-12 mb-4 rounded"></div>

      {/* Date Selector Skeleton */}
      <div className="flex gap-2 mb-4">
        {Array(5)
          .fill(0)
          .map((_, index) => (
            <div
              key={index}
              className="bg-gray-300 h-8 w-16 rounded"
            ></div>
          ))}
      </div>

      {/* Show Filter Selector Skeleton */}
      <div className="flex gap-2 mb-4">
        {Array(3)
          .fill(0)
          .map((_, index) => (
            <div
              key={index}
              className="bg-gray-300 h-8 w-24 rounded"
            ></div>
          ))}
      </div>

      {/* Showtime Card Skeletons */}
      <div className="space-y-4">
        {Array(3)
          .fill(0)
          .map((_, index) => (
            <div
              key={index}
              className="bg-gray-300 h-24 rounded"
            ></div>
          ))}
      </div>
    </div>
  );
};

export default ShowtimePageSkeletons;
