import { Ticket } from "./Ticket";
import { TicketSurcharge } from "./TicketSurcharge";

export interface TicketsResponse {
  tickets: Ticket[];
  ticketSurcharges: TicketSurcharge[];
}