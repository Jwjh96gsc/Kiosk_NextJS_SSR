import React, { useMemo } from 'react';
import { Ticket } from '@/app/types/tickets/Ticket';
import { Fab } from '@mui/material';
import { useAtom } from 'jotai';
import { selectedTicketsAtom, updateTicketQuantity } from '@/app/lib/atoms/selectedTicketsAtom';

interface TicketSelectorProps {
  ticket: Ticket;
  maxQuantity: number;
  selectedQuantity: number;
  onQuantityChange: (quantity: number) => void;
  totalSelectedQuantity: number; // Pass total selected quantity from parent
}

export default function TicketSelector({ ticket, maxQuantity, selectedQuantity, onQuantityChange, totalSelectedQuantity }: TicketSelectorProps) {
  const [selectedTickets, setSelectedTickets] = useAtom(selectedTicketsAtom);

  // Calculate whether the + and - buttons should be disabled
  const isMinusDisabled = useMemo(() => selectedQuantity === 0, [selectedQuantity]);
  const isPlusDisabled = useMemo(() => totalSelectedQuantity >= maxQuantity, [totalSelectedQuantity, maxQuantity]);

  // Handle decrease and increase
  const handleDecrement = () => {
    if (selectedQuantity > 0) {
      const newQuantity = selectedQuantity - 1;
      onQuantityChange(newQuantity);
      setSelectedTickets(updateTicketQuantity(selectedTickets, { ticketName: ticket.Name, quantity: newQuantity }));
    }
  };

  const handleIncrement = () => {
    if (totalSelectedQuantity < maxQuantity) {
      const newQuantity = selectedQuantity + 1;
      onQuantityChange(newQuantity);
      setSelectedTickets(updateTicketQuantity(selectedTickets, { ticketName: ticket.Name, quantity: newQuantity }));
    }
  };

  return (
    <div className="flex items-center justify-between gap-12 p-4 border border-gray-200 rounded-lg shadow-sm mb-4">
      {/* Ticket Name */}
      <div className="flex-1 min-w-0"> {/* Allow the name to shrink if needed */}
        <p className="text-lg font-medium">{ticket.Name}</p> 
      </div>

      {/* Price */}
      <p className="text-lg font-semibold whitespace-nowrap">RM {ticket.Price.toFixed(2)}</p>

      {/* Quantity Controls */}
      <div className="flex items-center gap-2">
        <Fab
          color="primary"
          size="small"
          aria-label="minus"
          onClick={handleDecrement}
          disabled={isMinusDisabled} // Disable the minus button if quantity is 0
          sx={{
            bgcolor: isMinusDisabled ? 'grey' : 'primary.main', // Grey out the button when disabled
          }}
        >
          -
        </Fab>

        <p className="text-lg font-semibold">{selectedQuantity}</p>

        <Fab
          color="primary"
          size="small"
          aria-label="add"
          onClick={handleIncrement}
          disabled={isPlusDisabled} // Disable the plus button if total selected quantity reaches the limit
        >
          +
        </Fab>
      </div>
    </div>
  );
}