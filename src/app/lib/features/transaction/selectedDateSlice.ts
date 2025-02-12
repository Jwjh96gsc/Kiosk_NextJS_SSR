import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SelectedDateState {
  date: string | null; // Use `null` or `string` to handle cases where no date is selected
}

const initialState: SelectedDateState = {
  date: null,
};

const selectedDateSlice = createSlice({
  name: 'selectedDate',
  initialState,
  reducers: {
    setSelectedDate(state, action: PayloadAction<string>) {
      state.date = action.payload;
    },
  },
});

export const { setSelectedDate } = selectedDateSlice.actions;
export default selectedDateSlice.reducer;
