import React from 'react';
import Link from 'next/link';
import { Showtime } from '@/app/types/showtimes/Showtime';

export default function ShowtimeCard({ showtimes, onShowtimeError }: { showtimes: Showtime[], onShowtimeError: (error: string) => void }) {
  const handleShowtimeClick = (e: React.MouseEvent, showtime: Showtime) => {
    const showTimeDate = new Date(showtime.showTime);
    const now = new Date();
    now.setSeconds(0, 0); // Remove seconds/milliseconds for consistency
    now.setMinutes(now.getMinutes() + 30); // Add 30 minutes, eg. 9:15AM showtime expire if 9:46AM
    
    if (showTimeDate < now) {
      e.preventDefault(); // Prevent navigation
      onShowtimeError("This showtime has expired. Please select another showtime.");
      return false;
    }

    return true;
  };

  const firstShowtime = showtimes[0];

  return (
    <div key={firstShowtime.filmCode} className="border border-gray-200 p-4 my-4 flex">
      {/* Left side: Image */}
      <img
        src={firstShowtime.image || '/NotFound.jpg'}
        alt={`${firstShowtime.name} poster`}
        className="w-48 h-50 rounded-lg shadow-xl mr-8"
      />

      {/* Right side: Content */}
      <div>
        <h2 className="font-semibold text-3xl mb-12">{firstShowtime.name}</h2>
        <p className="text-gray-500 text-xl mb-4">Language: {firstShowtime.language}</p>
        <p className="text-gray-500 text-xl mb-4">Hall: {firstShowtime.hall}</p>

        {/* Buttons for each showtime */}
        <div className="flex flex-wrap gap-2 mt-4">
          {showtimes.map((showtime) => {
            const hours = new Date(showtime.showTime).getHours().toString().padStart(2, '0');
            const minutes = new Date(showtime.showTime).getMinutes().toString().padStart(2, '0');

            return (
              <Link key={showtime.id} 
                href={{
                  pathname: `/kiosk/seats`,
                  query: {
                    id: showtime.id,
                    filmCode: showtime.filmCode,
                  }
                }}
                prefetch={true}
                onClick={(e) => handleShowtimeClick(e, showtime)}
              >
                <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                  {`${hours}:${minutes}`}
                </button>
              </Link>
            );
          })}
            
        </div>
      </div>
    </div>
  );
}
