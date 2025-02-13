import { Seat } from "./Seat";
import { SeatType } from "./SeatType";

export interface SeatsResponse {
  seats: Record<string, Seat[]>;
  seatTypes: SeatType[];
  hallSponsorImage: string;
}

export interface GetSeatsQueryResponse { 
    data: SeatsResponse; 
    error: any; 
    isLoading: boolean;
    refetch: any;
}