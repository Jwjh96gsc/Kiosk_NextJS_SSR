'use client';

import { useAtom } from "jotai";
import { Showtime } from "@/app/types/showtimes/Showtime";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { selectedDateAtom } from "@/app/lib/atoms/selectedDateAtom";
import SeatPageSkeletons from "@/app/ui/components/seats/SeatPageSkeletons";
import ShowtimeButton from "@/app/ui/components/seats/ShowtimeButton";
import TicketSectionSkeletons from "@/app/ui/components/tickets/TicketSectionSkeletons";
import dynamic from "next/dynamic";
import { Suspense, useMemo } from "react";
import { ShowtimeApiResponse, ShowtimesResponse } from "@/app/types/showtimes/ShowtimeApi";
import { SeatsResponse } from "@/app/types/seats/SeatApi";
import { TicketsResponse } from "@/app/types/tickets/TicketApi";
import { selectedSeatsAtom } from "@/app/lib/atoms/selectedSeatsAtom";
import { Seat } from "@/app/types/seats/Seat";

const SeatGrid = dynamic(() => import('@/app/ui/components/seats/SeatGrid'), {
  loading: () => <p>Loading seats...</p>,
});

const TicketSelectorList = dynamic(() => import('@/app/ui/components/tickets/TicketSelectorList'), {
  loading: () => <p>Loading tickets...</p>,
});

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SeatsComponent />
    </Suspense>
  );
}

function SeatsComponent() {
  const [selectedDate] = useAtom(selectedDateAtom);
  const [selectedSeats] = useAtom(selectedSeatsAtom);
  const params = useSearchParams();
  const id = params.get('id');
  const filmCode = params.get('filmCode');
  
  const { data: showtimeResponseData } = useQuery<ShowtimesResponse, unknown>({
    queryKey: ['showtimes', selectedDate],
    queryFn: async () => {
      const res = await fetch('/api/showtimes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ locationId: '268', oprndate: selectedDate }),
      });
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      // Fetch the raw response
      const rawData = await res.json();

      // Transform the Showtimes array
      const transformedShowtimes: Showtime[] = rawData.data.Response.Body.Showtimes.map((showtime: ShowtimeApiResponse) => {
        // Parse the date string in local time
        const localDate = new Date(showtime.ShowDate);
        
        // Extract date components in local time
        const year = localDate.getFullYear();
        const month = localDate.getMonth();
        const day = localDate.getDate();

        const [hours, minutes] = [
          parseInt(showtime.ShowTime.slice(0, 2), 10),
          parseInt(showtime.ShowTime.slice(2), 10),
        ];

        // Create a new date in local time
        const showDateTime = new Date(year, month, day, hours, minutes, 0);
        
        // Convert to ISO string without timezone offset
        const toLocalISOString = (date: Date) => {
          const pad = (n: number) => n < 10 ? `0${n}` : n;
          return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
        };

        return {
          filmCode: showtime.FilmCode,
          image: showtime.FilmPoster,
          name: showtime.FilmName,
          hall: showtime.HallCode,
          hallType: showtime.HallType,
          language: showtime.FilmLanguage,
          showDate: toLocalISOString(localDate), // Local date without time
          showTime: toLocalISOString(showDateTime), // Local date with time
          showDateTime: toLocalISOString(showDateTime), // Local date with time
          id: showtime.ShowId,
        };
      });

      // Group showtimes by filmCode
      const groupedShowtimes: Record<string, Showtime[]> = transformedShowtimes.reduce((acc: Record<string, Showtime[]>, showtime: Showtime) => {
        if (!acc[showtime.filmCode]) {
          acc[showtime.filmCode] = [];
        }
        acc[showtime.filmCode].push(showtime);
        return acc;
      }, {});
      
      // Transform the response to match ShowtimesResponse
      const transformedData: ShowtimesResponse = {
        showtimes: groupedShowtimes, // Grouped showtimes
        showFilters: rawData.data.Response.Body.ShowFilters, // Map ShowFilters
      };
      return transformedData;
    },
  });

  // Add memoization to selectedShowtime calculation
  const selectedShowtime = useMemo(() => {
    if (!showtimeResponseData?.showtimes || !id) return undefined;
    return Object.values(showtimeResponseData.showtimes)
      .flat()
      .find((showtime: Showtime) => showtime.id === id);
  }, [showtimeResponseData?.showtimes, id]); // Use optional chaining

  const { data: seatResponseData, error: errorFromHallSeats, isLoading: isLoadingFromHallSeats } = useQuery<SeatsResponse, unknown>({
    queryKey: ['hallSeats', selectedShowtime?.id],
    queryFn: async () => {
      if (!selectedShowtime) throw new Error("No selected showtime when getting seats."); 
      const res = await fetch('/api/seats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },        
        body: JSON.stringify({ 
          locationId: '268', 
          hallid: selectedShowtime.hall, 
          showdate: selectedShowtime.showDate.split('T')[0], // Directly use the date part
          showtime: new Date(selectedShowtime.showTime)
            .toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit' })
            .replace(':', ''),
        }),
      });
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      console.log(selectedShowtime);
      // Fetch the raw response
      const rawData = await res.json();

      // Transform the Seats array
      const seats = rawData.data.Response.Body.Seats;

      return {
        seats: seats.filter((seat: Seat) => seat.Type !== 'W'),
        seatTypes: rawData.data.Response.Body.SeatTypes || [],
        hallSponsorImage: rawData.data.Response.Body.HallSponsorImages?.[0]?.KioskImagePath || ''
      };
    },
    enabled: !!selectedShowtime?.id,
  });

  const { data: ticketResponseData, error: errorFromTicketPricing, isLoading: isLoadingFromTicketPricing } = useQuery<TicketsResponse, unknown>({
    queryKey: ['ticketPricing', selectedShowtime?.id],
    queryFn: async () => {
      if (!selectedShowtime) throw new Error("No selected showtime when getting tickets."); 
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },    
        body: JSON.stringify({ 
          locationId: '268', 
          hallid: selectedShowtime.hall, 
          filmid: selectedShowtime.filmCode,
          showdate: selectedShowtime.showDate.split('T')[0], 
          showtime: new Date(selectedShowtime.showTime)
            .toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit' })
            .replace(':', ''),
        }),
      });
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      // Fetch the raw response
      const rawData = await res.json();
  
      // Transform the response to match TicketsResponse
      const transformedData: TicketsResponse = {
        tickets: rawData.data.Response.Body.Tickets, // Map Tickets
        ticketSurcharges:rawData.data.Response.Body.TicketSurcharges, // Map TicketSurcharges
      };
  
      return transformedData;
    },
    enabled: !!selectedShowtime,
  });

  const selectedGroupedShowtimes = useMemo(() => {
    if (!showtimeResponseData?.showtimes || !filmCode) return undefined;
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30);
    return showtimeResponseData.showtimes[filmCode]?.filter((showtime: Showtime) => {
      const showDateTime = new Date(showtime.showDateTime);
      return showDateTime.toISOString().split("T")[0] === selectedDate && showDateTime >= now;
    });
  }, [showtimeResponseData, filmCode, selectedDate]);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <main style={{ flex: "1" }}>
        {selectedShowtime ? (
          <>
            <h1 className="text-3xl mb-4">{selectedShowtime.name}</h1>
            <h2 className="text-xl">Hall {selectedShowtime.hall}</h2>
            <h2 className="text-xl">
              {new Date(selectedShowtime.showDateTime).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}{', '}
              {new Date(selectedShowtime.showDateTime).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </h2>
          </>
        ) : (
          <p>No showtime was found.</p>
        )}

        {selectedGroupedShowtimes ? (
          <ShowtimeButton showtimes={selectedGroupedShowtimes} />
        ) : (
          <p>No other showtimes were found.</p>
        )}

        <hr className="my-8" />

        {isLoadingFromHallSeats ? (
          <SeatPageSkeletons />
        ) : errorFromHallSeats ? (
          <p>Error: {errorFromHallSeats instanceof Error ? errorFromHallSeats?.message : "An unexpected error occurred."}</p>
        ) : seatResponseData?.seats && seatResponseData.seats.length > 0 ? (
          <div className="flex flex-col items-center mx-auto w-full">
            {seatResponseData.hallSponsorImage && (
              <Image
                src={seatResponseData.hallSponsorImage}
                alt="Hall Sponsor Image"
                className="mb-4 max-w-lg h-auto bg-black"
                width={654}
                height={106}
              />
            )}
            <div className="w-full">
              <SeatGrid 
                seats={seatResponseData.seats} 
                seatTypes={seatResponseData.seatTypes || []}
              />
            </div>
          </div>
        ) : (
          <p>No Seats found for this showtime.</p>
        )}
      </main>

      <div className="border-t border-gray-300 my-8 p-4 text-center">
        <div className="flex justify-center items-center">
          <p className="mx-8">
            Selected Seats: {" "}
            {selectedSeats.map((seat) => `${seat.Row}${seat.Col}`).join(", ") || "None"}
          </p>
          <button className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">
            Confirm Seats
          </button>
        </div>
      </div>

      {isLoadingFromTicketPricing ? (
        <TicketSectionSkeletons />
      ) : errorFromTicketPricing ? (
        <p>Error: {errorFromTicketPricing instanceof Error ? errorFromTicketPricing?.message : "An unexpected error occurred."}</p>
      ) : ticketResponseData ? (
        <div>
          <TicketSelectorList tickets={ticketResponseData.tickets} selectedSeatsCount={selectedSeats.length} />
        </div>
      ) : (
        <p>No Tickets found for this showtime.</p>
      )}
    </div>
  );
}