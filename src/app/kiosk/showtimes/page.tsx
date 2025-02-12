'use client';

import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import ShowtimeCard from "@/app/ui/components/showtimes/ShowtimeCard";
import { Showtime } from "@/app/types/showtimes/Showtime";
import DateSelector from "@/app/ui/components/showtimes/DateSelector";
import { TransformedShowtimesResponse, useGetShowtimesQuery } from "@/app/lib/features/api/showtimeApiSlice";
import { setSelectedDate } from "@/app/lib/features/transaction/selectedDateSlice";
import ShowFilterSelector from "@/app/ui/components/showtimes/ShowFilterSelector";
import { ShowFilter } from "@/app/types/showtimes/ShowFilter";
import ShowtimePageSkeletons from "@/app/ui/components/showtimes/ShowtimePageSkeletons";

export default function Page() {
  // CONSTANTS
  const CATEGORY_ALL = "ALL";
  const CATEGORY_HALLTYPE = "HallType";
  const CATEGORY_FILMTYPE = "FilmType";

  // To update the Redux store with the data
  const dispatch = useDispatch();

  // Interface type for the response from useGetShowtimesQuery
  interface UseGetShowtimesQueryResponse { 
    data: TransformedShowtimesResponse; 
    error: any; 
    isLoading: boolean;
    refetch: any;
  }
  // Fetch showtimes from the API
  const { data: responseData, error, isLoading, refetch } = useGetShowtimesQuery({
    locationId: '268',
    oprndate: new Date().toISOString().split('T')[0],
  }) as UseGetShowtimesQueryResponse;

  // Available dates for all showtimes
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  // Date selected by customer
  const [selectedDate, setSelectedDateState] = useState<string | null>(null);
  // Show Filter selected by customer
  const [selectedShowFilter, setSelectedShowFilter] = useState<ShowFilter | null>(null);
  // Timer that refreshes showtimes every 15 minutes 
  const [isTimerActive, setIsTimerActive] = useState(true);
  // Error Message to display to customer
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // Timer Id 
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Set the time to filter out showtimes for filteredShowtimes
  const now = new Date();
  now.setSeconds(0, 0); // Remove seconds/milliseconds for consistency
  now.setMinutes(now.getMinutes() + 30); // Add 30 minutes, eg. 9:15AM showtime expire if 9:46AM

  // Function to set the current Date and store into Redux store
  const handleDateChange = (date: string) => {
    setSelectedDateState(date);
    dispatch(setSelectedDate(date)); 
  };

  // Function to set the current ShowFilter
  const handleShowFilterChange = (showFilter: ShowFilter) => {
    setSelectedShowFilter(showFilter);
  };

  // Function to set the current ShowFilter
  const isShowtimeInFilter = (showtime: Showtime) : boolean => {
    if (selectedShowFilter?.category == CATEGORY_ALL)
    {
      return true; 
    }

    if (selectedShowFilter?.category == CATEGORY_HALLTYPE)
    {
      return showtime.hallType === selectedShowFilter.keyword; 
    }

    if (selectedShowFilter?.category == CATEGORY_FILMTYPE)
    {
      return showtime.name.includes(selectedShowFilter.keyword); 
    }

    return false;
  };

  // Function to pop up message if customer pressed an expired showtime
  const handleShowtimeError = (error: string) => {
    setErrorMessage(error);
    refetch();
    startTimer();
  }

  // 1. Set the selected date and set dates for DateSelector
  useEffect(() => {
    if (responseData?.showtimes && responseData?.showFilters) {
      // Get available dates from showtimes
      const availableDatesSet = new Set<string>();

      // Extract and sort dates from showtimes
      Object.values(responseData.showtimes).forEach((showtimes: Showtime[]) => {
        showtimes.forEach((showtime: Showtime) => {
          availableDatesSet.add(showtime.showDateTime.split("T")[0]);
        });
      });

      setAvailableDates(Array.from(availableDatesSet).sort());
      
      // Set initial show filter
      handleShowFilterChange(responseData?.showFilters[0]);
    }
    // Set initial selected date
    const today = new Date().toISOString().split('T')[0];
    handleDateChange(today); 
  }, [responseData?.showtimes, responseData?.showFilters]);

  // 2. Fetch data on mount and set a timer for refreshing every 15 minutes
  const startTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null; // Reset to ensure proper state
    }
    const newTimerId = setInterval(() => {
      if (isTimerActive) {
        refetch();
      }
    }, 10000); //10 minutes - 600000
    timerRef.current = newTimerId;
  };

  useEffect(() => {
    startTimer();

    // Cleanup timer on unmount
    return ()=> {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isTimerActive, refetch]);

  // 3. Toggle the timer based on page visibility
  useEffect(() => {
    // Visibility change handler to enable/disable timer
    const handleVisibilityChange = () => {
      setIsTimerActive(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, []);

  // 4. Prepare the showtimes to be shown to customer
  const filteredShowtimes = selectedDate && responseData?.showtimes && responseData?.showFilters?
    Object.keys(responseData.showtimes).reduce<Record<string, Showtime[]>>((acc, filmCode) => {      
      const filteredShowtimes = responseData.showtimes[filmCode].filter((showtime) => {
        const showDateTime = new Date(showtime.showDateTime);
        return (
          isShowtimeInFilter(showtime) &&
          showDateTime.toISOString().split('T')[0] === selectedDate &&
          showDateTime >= now
        );
      });
      if (filteredShowtimes.length > 0) {
        acc[filmCode] = filteredShowtimes;
      }
      return acc;
    }, {})
  : responseData?.showtimes
  ;

  return (
    <>
      <h1 className="text-2xl">Available showtimes</h1>
  
      {errorMessage && (
        <div className="bg-red-500 text-white p-4 mb-4 rounded">
          {errorMessage}
        </div>
      )}
  
      {isLoading ? (
        <ShowtimePageSkeletons /> // Render the skeleton while loading
      ) : error ? (
        <p className="text-red-500">Failed to load showtimes: {error.toString()}</p>
      ) : (
        <>
          {availableDates.length > 0 && (
            <DateSelector
              dates={availableDates}
              selectedDate={selectedDate}
              onDateChange={(e) => handleDateChange(e)}
            />
          )}
  
          {responseData?.showFilters && (
            <ShowFilterSelector 
              showFilters={responseData?.showFilters}
              selectedShowFilter={selectedShowFilter}
              onFilterChange={(e) => handleShowFilterChange(e)}
            />
          )}
  
          {filteredShowtimes && Object.keys(filteredShowtimes).length > 0 ? (
            Object.keys(filteredShowtimes)
              .filter((filmCode) => filteredShowtimes[filmCode].length > 0)
              .map((filmCode) => (
                <ShowtimeCard
                  key={filmCode}
                  showtimes={filteredShowtimes[filmCode]}
                  onShowtimeError={handleShowtimeError}
                />
              ))
          ) : (
            <p>No showtimes available for the selected date.</p>
          )}
        </>
      )}
    </>
  );
  
}

