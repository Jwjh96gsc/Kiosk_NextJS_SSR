import React from "react";
import SeatButton from "@/app/ui/components/seats/SeatButton";
import { Seat } from "@/app/types/seats/Seat";
import { SeatType } from "@/app/types/seats/SeatType";

interface SeatGridProps {
  seats: Seat[];
  seatTypes: SeatType[];
}

export default function SeatGrid({ seats, seatTypes }: SeatGridProps) {
  // Calculate grid dimensions based on seat coordinates
  const gridColumns = Math.max(...seats.map((seat) => parseInt(seat.x, 10))) + 1;
  const gridRows = Math.max(...seats.map((seat) => parseInt(seat.y, 10))) + 1;
  console.log(seats);
  console.log(seatTypes);
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${gridColumns}, 3rem)`,
        gridTemplateRows: `repeat(${gridRows}, 3rem)`,
        gap: "10px",
        position: "relative",
        justifyContent: "center",
        overflow: "auto"
      }}
    >
      {seats.map((seat) => (
        <div
          key={seat.Row + seat.Col}
          style={{
            gridColumn: parseInt(seat.x, 10) + 1, // Convert x to grid column
            gridRow: parseInt(seat.y, 10) + 1, // Convert y to grid row
          }}
        >
          <SeatButton key={seat.SeatId} seat={seat} seatTypes={seatTypes}/>
        </div>
      ))}
    </div>
  );
}
