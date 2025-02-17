import { Seat } from "./Seat";
import { SeatType } from "./SeatType";

export interface SeatsResponse {
  seats: Seat[];
  seatTypes: SeatType[];
  hallSponsorImage: string;
}
