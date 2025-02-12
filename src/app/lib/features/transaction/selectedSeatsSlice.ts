import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Seat {
  Row: string;
  Col: string;
}

interface SeatSelectionState {
  selectedSeats: Seat[];
}

const initialState: SeatSelectionState = {
  selectedSeats: [],
};

const seatSelectionSlice = createSlice({
  name: "seatSelection",
  initialState,
  reducers: {
    toggleSeatSelection: (state, action: PayloadAction<Seat>) => {
      const seat = action.payload;
      const seatIndex = state.selectedSeats.findIndex(
        (s) => s.Row === seat.Row && s.Col === seat.Col
      );

      if (seatIndex >= 0) {
        // Seat is already selected, remove it
        state.selectedSeats.splice(seatIndex, 1);
      } else {
        // Seat is not selected, add it
        state.selectedSeats.push(seat);
      }

      // Sort seats by row and column for consistent order
      state.selectedSeats.sort((a, b) =>
        a.Row === b.Row ? a.Col.localeCompare(b.Col) : a.Row.localeCompare(b.Row)
      );
    },
    clearSelectedSeats: (state) => {
      state.selectedSeats = [];
    }
  },
});

export const { toggleSeatSelection, clearSelectedSeats } = seatSelectionSlice.actions;
export default seatSelectionSlice.reducer;
