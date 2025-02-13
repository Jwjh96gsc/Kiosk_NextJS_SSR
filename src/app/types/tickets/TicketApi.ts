import { Ticket } from "./Ticket";
import { TicketSurcharge } from "./TicketSurcharge";

export interface TicketsResponse {
  tickets: Ticket[];
  ticketSurcharges: TicketSurcharge[];
}

export interface GetTicketsQueryResponse { 
    data: TicketsResponse; 
    error: any; 
    isLoading: boolean;
    refetch: any;
}