import { BaseQueryApi, createApi, fetchBaseQuery, FetchBaseQueryArgs } from '@reduxjs/toolkit/query/react';
import { Showtime } from "@/app/types/showtimes/Showtime";
import { ShowFilter } from '@/app/types/showtimes/ShowFilter';
import { Seat } from '@/app/types/seats/Seat';
import { SeatType } from '@/app/types/seats/SeatType';
import { HYDRATE } from "next-redux-wrapper";
import { Action, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../store';
import { Ticket } from '@/app/types/tickets/Ticket';
import { TicketSurcharge } from '@/app/types/tickets/TicketSurcharge';

export interface TransformedShowtimesResponse {
  showtimes: Record<string, Showtime[]>;
  showFilters: ShowFilter[];
}

export interface TransformedHallSeatsResponse {
  seats: Record<string, Seat[]>;
  seatTypes: SeatType[];
  hallSponsorImage: string;
}

export interface TransformedTicketPricingResponse {
  tickets: Ticket[];
  ticketSurcharges: TicketSurcharge[];
}

function isHydrateAction(action: Action): action is PayloadAction<RootState> {
  return action.type === HYDRATE
}

// Define the API
export const showtimeApiSlice = createApi({
  reducerPath: 'showtimeApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/' }),
  extractRehydrationInfo(action, { reducerPath }): any {
    if (isHydrateAction(action)) {
      return action.payload[reducerPath]
    }
  },
  tagTypes: ['Showtimes'],
  endpoints: (builder) => ({
    // API: Get the movies and showtimes
    getShowtimes: builder.query<TransformedShowtimesResponse, {locationId: string; oprndate:string}>({
      query: ({locationId, oprndate}) => ({
        url: 'showtimes',
        method: 'POST',
        body: {locationId, oprndate},
      }),
      keepUnusedDataFor: 31536000,  // 31536000 Set to 1 year (in seconds) to never expire, this is needed so second page will not reload
      transformResponse: (response: any) => {
        // 1. Map API response to Showtime[]
        const showtimes = response.data.Response.Body.Showtimes.map((showtime: any): Showtime => {
          const showDate = new Date(showtime.ShowDate);
          showDate.setHours(0, 0, 0, 0);

          const [hours, minutes] = [
            parseInt(showtime.ShowTime.slice(0, 2), 10),
            parseInt(showtime.ShowTime.slice(2), 10),
          ];
          const showTime = showDate;
          showTime.setHours(hours, minutes, 0, 0);

          const showDateTime = showDate;
          showDateTime.setHours(hours, minutes, 0, 0);

          return {
            filmCode: showtime.FilmCode,
            image: showtime.FilmPoster,
            name: showtime.FilmName,
            hall: showtime.HallCode,
            hallType: showtime.HallType,
            language: showtime.FilmLanguage,
            showDate: showDate.toISOString(),
            showTime: showTime.toISOString(),
            showDateTime: showDateTime.toISOString(),
            id: showtime.ShowId,
          };
        });
        
        // Apply filtering and grouping
        const now = new Date();
        now.setSeconds(0, 0);

        const groupedShowtimes: Record<string, Showtime[]> = {};
        showtimes.forEach((showtime: Showtime) => {
          if (!groupedShowtimes[showtime.filmCode]) {
            groupedShowtimes[showtime.filmCode] = [];
          }
          groupedShowtimes[showtime.filmCode].push(showtime);
        }) ;   

        Object.entries(groupedShowtimes).forEach(([filmCode, showtimes]) => {
          groupedShowtimes[filmCode] = showtimes.sort((a: Showtime, b: Showtime) => 
            new Date(a.showDateTime).getTime() - new Date(b.showDateTime).getTime()
          );
        });

        // 2. Extract ShowFilters from the response
        const showFilters = response.data.Response.Body.ShowFilters.map((showFilter: any): ShowFilter => {
          return {
            description: showFilter.Description,
            keyword: showFilter.Keyword,
            category: showFilter.Category
          };
        });
        
        return { showtimes: groupedShowtimes, showFilters };
      },      
    }),
    // API: Get the hall seats after customer has selected the showtime
    getHallSeatStatus: builder.query<TransformedHallSeatsResponse, { locationId: string; hallid: string; showdate: string; showtime: string }>({
      query: ({locationId, hallid, showdate, showtime}) => ({
        url: 'seats',
        method: 'POST',
        body: {locationId, hallid, showdate, showtime},
      }),
      transformResponse: (response: any) => {
        // 1. Map API response to Seat[]
        const seats = response.data.Response.Body.Seats.map((seat: any): Seat => {
          return {
            Col: seat.Col,
            Flipped: seat.Flipped,
            HallId: seat.HallId,
            Priority: seat.Priority,
            Row: seat.Row,
            SeatCode: seat.SeatCode,
            SeatId: seat.SeatId,
            Section: seat.Section,
            Status: seat.Status,
            Type: seat.Type,
            x: seat.x,
            y: seat.y,
          };
        });

        // Apply filtering and grouping
        const grouped: Record<string, Seat[]> = {};
        for (const seat of seats) {
          if (seat.Type === 'W') {
            continue; // Skip this seat if its Type is 'W'
          }
        
          if (!grouped[seat.Row]) {
            grouped[seat.Row] = [];
          }
          grouped[seat.Row].push(seat);
        }
        
        Object.entries(grouped).forEach(([Row, seats]) => {
          grouped[Row] = seats.sort((a: Seat, b: Seat) => 
            parseInt(a.Col, 10) - parseInt(b.Col, 10)
          );
        });

        // 2. Get SeatTypes from response
        const seatTypes =  response.data.Response.Body.SeatTypes.map((seatType: any): SeatType => {
          return {
            Name: seatType.Name,
            NumOfSeats: seatType.NumOfSeats,
            Type: seatType.Type,
            Code: seatType.Code,
          };
        });

        // 3. Get Hall Sponsor Image, if not use default hall image
        const hallSponsorImage: string = response.data.Response.Body.HallSponsorImages[0].KioskImagePath;
        return {seats: grouped, seatTypes, hallSponsorImage };
      }  
    }),
    
    // API: Get the price of tickets while customer is choosing
    getTicketPricing: builder.query<TransformedTicketPricingResponse, { locationId: string; hallid: string; filmid: string; showdate: string; showtime: string }>({
      query: ({locationId, hallid, filmid, showdate, showtime}) => ({
        url: 'tickets',
        method: 'POST',
        body: {locationId, hallid, filmid, showdate, showtime},
      }),
      transformResponse: (response: any) => {
        // 1. Map API response to Ticket[]
        const tickets = response.data.Response.Body.Tickets.map((ticket: any): Ticket => {
          return {
            Name: ticket.Name,
            Price: ticket.Price,
            Mapping: ticket.Mapping,
            SeatTaken: ticket.SeatTaken,
            LoyaltyDiscount: ticket.LoyaltyDiscount,
            HideEpay: ticket.HideEpay,
            Tax1: ticket.Tax1,
            Tax2: ticket.Tax2,
            Tax3: ticket.Tax3,
            Tax4: ticket.Tax4,
            MealPrice: ticket.MealPrice,
            OtsgPrice: ticket.OtsgPrice,
            ProdG08: ticket.ProdG08,
            Quantity: 0, // init to 0
          };
        });

        // // Apply filtering and grouping
        // const grouped: Record<string, Ticket[]> = {};
        // for (const ticket of tickets) {        
        //   if (!grouped[ticket.Row]) {
        //     grouped[ticket.Row] = [];
        //   }
        //   grouped[ticket.Row].push(ticket);
        // }

        // 2. Get TicketSurcharge from response
        const ticketSurcharges =  response.data.Response.Body.Surcharges.map((ticketSurcharge: any): TicketSurcharge => {
          return {
            Id: ticketSurcharge.Id,
            SurchargeCode: ticketSurcharge.SurchargeCode,
            SurchargeAmt: ticketSurcharge.SurchargeAmt,
            SurchargeDiscount: ticketSurcharge.SurchargeDiscount,
            Tax1: ticketSurcharge.Tax1,
            Tax2: ticketSurcharge.Tax2,
            Tax3: ticketSurcharge.Tax3,
            Tax4: ticketSurcharge.Tax4,
          };
        });
        
        return {tickets, ticketSurcharges };
      }  
    }),
  }),
});

// Export hooks for the API
export const { useGetShowtimesQuery, useGetHallSeatStatusQuery, useGetTicketPricingQuery } = showtimeApiSlice;
