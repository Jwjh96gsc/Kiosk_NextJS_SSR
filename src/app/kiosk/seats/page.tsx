'use client';

import { useAtom } from "jotai";
import { Showtime } from "@/app/types/showtimes/Showtime";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { selectedDateAtom, selectedSeatsAtom } from "@/app/lib/atoms/selectedDateAtom";
import SeatPageSkeletons from "@/app/ui/components/seats/SeatPageSkeletons";
import ShowtimeCard from "@/app/ui/components/seats/ShowtimeCard";
import TicketSectionSkeletons from "@/app/ui/components/tickets/TicketSectionSkeletons";
import dynamic from "next/dynamic";
import { Suspense, useMemo } from "react";
import { GetShowtimesQueryResponse } from "@/app/types/showtimes/ShowtimeApi";
import { GetSeatsQueryResponse } from "@/app/types/seats/SeatApi";
import { GetTicketsQueryResponse } from "@/app/types/tickets/TicketApi";

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
  const [selectedSeats, setSelectedSeats] = useAtom(selectedSeatsAtom);
  const params = useSearchParams();
  const id = params.get('id');
  const filmCode = params.get('filmCode');
  
  const { data: showtimeResponseData } = useQuery({
    queryKey: ['showtimes', selectedDate],
    queryFn: async () => {
      const res = await fetch('/api/showtimes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ locationId: '268', oprndate: selectedDate }),
      });
    },
  }) as GetShowtimesQueryResponse;

  const selectedShowtime = useMemo(() => {
    if (!showtimeResponseData?.showtimes || !id) return undefined;
    return Object.values(showtimeResponseData.showtimes)
      .flat()
      .find((showtime: Showtime) => showtime.id === id);
  }, [showtimeResponseData, id]);

  const { data: seatResponseData, error: errorFromHallSeats, isLoading: isLoadingFromHallSeats } = useQuery({
    queryKey: ['hallSeats', selectedShowtime?.id],
    queryFn: async () => {
      if (!selectedShowtime) return;
      const res = await fetch('/api/seats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ locationId: '268', hallid: selectedShowtime.hall, showdate: selectedShowtime.showDate.split('T')[0], showtime: new Date(selectedShowtime.showTime).toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit' }).replace(':', '') }),
      });
      return res.json();
    },
    enabled: !!selectedShowtime,
  }) as GetSeatsQueryResponse;

  const { data: ticketResponseData, error: errorFromTicketPricing, isLoading: isLoadingFromTicketPricing } = useQuery({
    queryKey: ['ticketPricing', selectedShowtime?.id],
    queryFn: async () => {
      if (!selectedShowtime) return;
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ locationId: '268', hallid: selectedShowtime.hall, filmid: selectedShowtime.filmCode, showdate: selectedShowtime.showDate.split('T')[0], showtime: new Date(selectedShowtime.showTime).toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit' }).replace(':', '') }),
      });
      return res.json();
    },
    enabled: !!selectedShowtime,
  }) as GetTicketsQueryResponse;

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
          <ShowtimeCard showtimes={selectedGroupedShowtimes} />
        ) : (
          <p>No other showtimes were found.</p>
        )}

        <hr className="my-8" />

        {isLoadingFromHallSeats ? (
          <SeatPageSkeletons />
        ) : errorFromHallSeats ? (
          <p>Error: {errorFromHallSeats?.message || "An unexpected error occurred."}</p>
        ) : seatResponseData?.seats ? (
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
              <SeatGrid seats={Object.values(seatResponseData.seats).flat()} seatTypes={seatResponseData.seatTypes} />
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
        <p>Error: {errorFromTicketPricing?.message || "An unexpected error occurred."}</p>
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