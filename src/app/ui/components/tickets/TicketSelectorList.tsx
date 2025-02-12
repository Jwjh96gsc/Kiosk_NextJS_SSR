import React, { useState, useEffect, useMemo } from 'react';
import { Ticket } from '@/app/types/tickets/Ticket';
import TicketSelector from './TicketSelector';

interface TicketSelectorListProps {
  tickets: Ticket[];
  selectedSeatsCount: number; // Add this prop to limit total ticket count
}

export default function TicketSelectorList({ tickets, selectedSeatsCount }: TicketSelectorListProps) {
  const [ticketQuantities, setTicketQuantities] = useState<Record<string, number>>({});

  // Reset ticket quantities when selectedSeatsCount changes
  useEffect(() => {
    setTicketQuantities({});
  }, [selectedSeatsCount]);

  // Calculate total selected quantity dynamically
  const totalSelectedQuantity = useMemo(() => {
    return Object.values(ticketQuantities).reduce((total, quantity) => total + quantity, 0);
  }, [ticketQuantities]);

  // Handle quantity changes for a specific ticket
  const handleQuantityChange = (ticketName: string, newQuantity: number) => {
    const currentQuantity = ticketQuantities[ticketName] || 0;
    const newTotal = totalSelectedQuantity - currentQuantity + newQuantity;

    // Ensure the total quantity does not exceed the selected seats count
    if (newTotal <= selectedSeatsCount) {
      setTicketQuantities((prevQuantities) => ({
        ...prevQuantities,
        [ticketName]: newQuantity,
      }));
    }
  };

  return (
    <div className="flex flex-col items-center w-full"> {/* Center the list */}
      <div className="w-full max-w-md"> {/* Constrain the width for better alignment */}
        {tickets.map((ticket) => (
          <TicketSelector
            key={ticket.Name}
            ticket={ticket}
            maxQuantity={selectedSeatsCount} // Pass maxQuantity to each TicketSelector
            selectedQuantity={ticketQuantities[ticket.Name] || 0}
            onQuantityChange={(quantity) => handleQuantityChange(ticket.Name, quantity)}
            totalSelectedQuantity={totalSelectedQuantity}
          />
        ))}
      </div>
    </div>
  );
}