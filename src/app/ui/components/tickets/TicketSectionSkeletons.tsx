'use client';

export default function TicketSectionSkeletons() {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <main style={{ flex: "1", padding: "2rem" }}>
        {/* Placeholder for Seat Grid */}
        <div className="mb-8">
          <div className="animate-pulse bg-gray-300 h-8 w-1/3 mb-4"></div>
          <div className="grid grid-cols-5 gap-4">
            {Array(10)
              .fill(0)
              .map((_, index) => (
                <div
                  key={index}
                  className="animate-pulse bg-gray-300 h-12 w-full rounded-lg"
                ></div>
              ))}
          </div>
        </div>
      </main>
    </div>
  );
}
