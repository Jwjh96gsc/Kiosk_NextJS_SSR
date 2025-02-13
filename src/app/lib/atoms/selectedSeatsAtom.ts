import { atom } from 'jotai';

export interface SimpleSeat {
  Row: string;
  Col: string;
}

export const selectedSeatsAtom = atom<SimpleSeat[]>([]);

export const toggleSeatSelection = (selectedSeats: SimpleSeat[], seat: SimpleSeat) => {
  const isSelected = selectedSeats.some((s) => s.Row === seat.Row && s.Col === seat.Col);
  if (isSelected) {
    return selectedSeats.filter((s) => s.Row !== seat.Row || s.Col !== seat.Col);
  } else {
    return [...selectedSeats, seat];
  }
};