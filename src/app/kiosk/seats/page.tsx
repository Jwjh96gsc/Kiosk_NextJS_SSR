import { GetServerSideProps } from 'next';
import { QueryClient, dehydrate, useQuery } from '@tanstack/react-query';
import { Showtime } from '@/app/types/showtimes/Showtime';
import { TransformedHallSeatsResponse, TransformedTicketPricingResponse } from '@/app/lib/features/api/showtimeApiSlice';
import SeatGrid from '@/app/ui/components/seats/SeatGrid';
import TicketSelectorList from '@/app/ui/components/tickets/TicketSelectorList';

interface SeatsPageProps {
  selectedSeatsCount: number;
}

export default function SeatsPage({ selectedSeatsCount }: SeatsPageProps) {
  // Fetch seat data using TanStack Query
  const { data: seatData, isLoading: isSeatLoading } = useQuery({
    queryKey: ['seats'],
    queryFn: async () => {
      const response = await fetch('/api/seats'); // Replace with your API endpoint
      return response.json() as Promise<TransformedHallSeatsResponse>;
    },
  });

  // Fetch ticket data using TanStack Query
  const { data: ticketData, isLoading: isTicketLoading } = useQuery({
    queryKey: ['tickets'],
    queryFn: async () => {
      const response = await fetch('/api/tickets'); // Replace with your API endpoint
      return response.json() as Promise<TransformedTicketPricingResponse>;
    },
  });

  if (isSeatLoading || isTicketLoading) {
    return <p>Loading...</p>; // Show a loading state
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <main style={{ flex: "1" }}>
        <h1 className="text-3xl mb-4">Seats Page</h1>

        {/* Display SeatGrid */}
        {seatData && (
          <div className="flex flex-col items-center mx-auto w-full">
            {seatData.hallSponsorImage && (
              <img
                src={seatData.hallSponsorImage}
                alt="Hall Sponsor Image"
                className="mb-4 max-w-lg h-auto bg-black"
                width={654}
                height={106}
              />
            )}
            <div className="w-full">
              <SeatGrid seats={Object.values(seatData.seats).flat()} seatTypes={seatData.seatTypes} />
            </div>
          </div>
        )}

        {/* Display TicketSelectorList */}
        {ticketData && (
          <div>
            <TicketSelectorList tickets={ticketData.tickets} selectedSeatsCount={selectedSeatsCount} />
          </div>
        )}
      </main>
    </div>
  );
}

// Fetch data on the server side
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id, filmCode } = context.query;

  if (!id || !filmCode) {
    return {
      notFound: true, // Return a 404 page if required params are missing
    };
  }

  const queryClient = new QueryClient();

  try {
    // Pre-fetch seat data
    await queryClient.prefetchQuery({
      queryKey: ['seats'],
      queryFn: async () => {
        const response = await fetch('http://your-api.com/seats', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            locationId: '268',
            hallid: id,
            showdate: new Date().toISOString().split('T')[0],
            showtime: new Date().toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit' }).replace(':', ''),
          }),
        });
        return response.json() as Promise<TransformedHallSeatsResponse>;
      },
    });

    // Pre-fetch ticket data
    await queryClient.prefetchQuery({
      queryKey: ['tickets'],
      queryFn: async () => {
        const response = await fetch('http://your-api.com/tickets', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            locationId: '268',
            hallid: id,
            filmid: filmCode,
            showdate: new Date().toISOString().split('T')[0],
            showtime: new Date().toLocaleTimeString('en-GB', { hour12: false, hour: '2-digit', minute: '2-digit' }).replace(':', ''),
          }),
        });
        return response.json() as Promise<TransformedTicketPricingResponse>;
      },
    });

    return {
      props: {
        dehydratedState: dehydrate(queryClient), // Dehydrate the query client for SSR
        selectedSeatsCount: 0, // You can calculate this based on the fetched data
      },
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return {
      notFound: true, // Return a 404 page if there's an error
    };
  }
};