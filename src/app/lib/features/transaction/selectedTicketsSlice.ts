import { Ticket } from '@/app/types/tickets/Ticket';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TicketState {
  tickets: Ticket[]; 
}

const initialState: TicketState = {
  tickets: [],
};

const selectedTicketsSlice = createSlice({
  name: 'selectedTickets',
  initialState,
  reducers: {
    updateTicketQuantity(state, action: PayloadAction<{ ticketName: string, quantity: number }>) {
      const { ticketName, quantity } = action.payload;
      const ticket = state.tickets.find(t => t.Name === ticketName);
      if (ticket) {
        ticket.Quantity = quantity;
      }
    },
  },
});

export const { updateTicketQuantity } = selectedTicketsSlice.actions;
export default selectedTicketsSlice.reducer;
