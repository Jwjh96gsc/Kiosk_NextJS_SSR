import React from "react";
import { Seat } from "@/app/types/seats/Seat";
import styles from '@/app/ui/components/seats/SeatButton.module.css'
import { SeatType } from "@/app/types/seats/SeatType";
import { useAtom } from "jotai";
import { selectedSeatsAtom, toggleSeatSelection } from "@/app/lib/atoms/selectedSeatsAtom";

interface SeatButtonProps {
  seat: Seat;
  seatTypes: SeatType[];
}

export default function SeatButton({ seat, seatTypes }: SeatButtonProps) {
  const [selectedSeats, setSelectedSeats] = useAtom(selectedSeatsAtom);

  const isSelected = selectedSeats.some(
    (s) => s.Row === seat.Row && s.Col === seat.Col
  );

  const handleClick = () => {
    setSelectedSeats(toggleSeatSelection(selectedSeats, { Row: seat.Row, Col: seat.Col }));
  };

  // Determine the class based on the seat status
  let seatStatusClass = '';
  let backgroundImage = '';
  switch (seat.Status) {
    case "A": // Available
      const seatType = seatTypes.find(x => x.Type === seat.Type);
      backgroundImage = `/icons/seats/${seatType?.Name.split(' ').join('')}_seat.png`;
      break;
    case "D": // Damaged
      seatStatusClass = styles.repair;
      break;
    case "R": // Reserved
      seatStatusClass = styles.occupied;
      break;
    case "B": // Occupied
      seatStatusClass = styles.occupied;
      break;
    case "T": // Locked
      seatStatusClass = styles.locked;
      break;
    case "X": // Blocked
      seatStatusClass = styles.blocked;
      break;
    default:
      seatStatusClass = styles.default;
      break;
  }

  return (
    <div
      className={`${styles.seatButton} ${isSelected ? styles.selected : ""} ${seatStatusClass} ${seat.Status !== "A" || seat.Type === 'H' ? styles.notAllowed : ""}`}
      style={seat.Status === "A" ? {backgroundImage: `url(${backgroundImage})`} : {}}
      onClick={handleClick}
    >
      {seat.Row}{seat.Col}
    </div>
  );
}
