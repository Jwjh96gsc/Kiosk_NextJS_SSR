import { Ticket } from '@/app/types/tickets/Ticket';
import { atom } from 'jotai';

export const selectedTicketsAtom = atom<Ticket[]>([]);

export const updateTicketQuantity = (selectedTickets: Ticket[], { ticketName, quantity }: { ticketName: string; quantity: number }) : Ticket[] => {
  const existingTicket = selectedTickets.find(t => t.Name === ticketName);
  if (existingTicket) existingTicket.Quantity = quantity;
  return selectedTickets;
};
