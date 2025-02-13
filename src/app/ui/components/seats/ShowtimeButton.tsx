import React from 'react';
import Link from 'next/link';
import { Showtime } from '@/app/types/showtimes/Showtime';

export default function ShowtimeButton({ showtimes }: { showtimes: Showtime[] }) {
  return (
    <>
      <div>
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
              >
                <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                  {`${hours}:${minutes}`}
                </button>
              </Link>
            );
          })}
            
        </div>
      </div>
    </>
  );
}
