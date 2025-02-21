'use client';

import { useCallback, useEffect, useRef, useState } from "react";
import { useAtom } from "jotai";
import ShowtimeCard from "@/app/ui/components/showtimes/ShowtimeCard";
import { Showtime } from "@/app/types/showtimes/Showtime";
import DateSelector from "@/app/ui/components/showtimes/DateSelector";
import { useQuery } from "@tanstack/react-query";
import { selectedDateAtom } from "@/app/lib/atoms/selectedDateAtom";
import ShowFilterSelector from "@/app/ui/components/showtimes/ShowFilterSelector";
import { ShowFilter } from "@/app/types/showtimes/ShowFilter";
import ShowtimePageSkeletons from "@/app/ui/components/showtimes/ShowtimePageSkeletons";
import { ShowtimeApiResponse, ShowtimesResponse } from "@/app/types/showtimes/ShowtimeApi";

const CATEGORY_ALL = "ALL";
const CATEGORY_HALLTYPE = "HallType";
const CATEGORY_FILMTYPE = "FilmType";

export default function Page() {
  const [selectedDate, setSelectedDate] = useAtom(selectedDateAtom);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedShowFilter, setSelectedShowFilter] = useState<ShowFilter | null>(null);
  const [isTimerActive, setIsTimerActive] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const now = new Date();
  now.setSeconds(0, 0);
  now.setMinutes(now.getMinutes() + 30);

  const { data: responseData, error, isLoading, refetch } = useQuery<ShowtimesResponse, unknown>({
    queryKey: ['showtimes', selectedDate],
    queryFn: async () => {
      const res = await fetch('/api/showtimes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ locationId: '268', oprndate: selectedDate }),
      });
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      // Fetch the raw response
      const rawData = await res.json();

      // Transform the Showtimes array
      const transformedShowtimes: Showtime[] = rawData.data.Response.Body.Showtimes.map((showtime: ShowtimeApiResponse) => {
        // Parse the date string in local time
        const localDate = new Date(showtime.ShowDate);
        
        // Extract date components in local time
        const year = localDate.getFullYear();
        const month = localDate.getMonth();
        const day = localDate.getDate();

        const [hours, minutes] = [
          parseInt(showtime.ShowTime.slice(0, 2), 10),
          parseInt(showtime.ShowTime.slice(2), 10),
        ];

        // Create a new date in local time
        const showDateTime = new Date(year, month, day, hours, minutes, 0);
        
        // Convert to ISO string without timezone offset
        const toLocalISOString = (date: Date) => {
          const pad = (n: number) => n < 10 ? `0${n}` : n;
          return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
        };
        
        return {
          filmCode: showtime.FilmCode,
          image: showtime.FilmPoster,
          name: showtime.FilmName,
          hall: showtime.HallCode,
          hallType: showtime.HallType,
          language: showtime.FilmLanguage,
          showDate: toLocalISOString(localDate), // Local date without time
          showTime: toLocalISOString(showDateTime), // Local date with time
          showDateTime: toLocalISOString(showDateTime), // Local date with time
          id: showtime.ShowId,
        };
      });

      // Group showtimes by filmCode
      const groupedShowtimes: Record<string, Showtime[]> = transformedShowtimes.reduce((acc: Record<string, Showtime[]>, showtime: Showtime) => {
        if (!acc[showtime.filmCode]) {
          acc[showtime.filmCode] = [];
        }
        acc[showtime.filmCode].push(showtime);
        return acc;
      }, {});
      
      // Transform the response to match ShowtimesResponse
      const transformedData: ShowtimesResponse = {
        showtimes: groupedShowtimes, // Grouped showtimes
        showFilters: rawData.data.Response.Body.ShowFilters, // Map ShowFilters
      };
      return transformedData;
    },
  });

  const handleDateChange = useCallback((date: string) => {
    setSelectedDate(date);
  }, [setSelectedDate]);

  const handleShowFilterChange = useCallback((showFilter: ShowFilter) => {
    setSelectedShowFilter(showFilter); // Replace merge logic with direct assignment
  }, []);

  const isShowtimeInFilter = (showtime: Showtime): boolean => {
    if (!selectedShowFilter) return true;
    if (selectedShowFilter?.Category === CATEGORY_ALL) return true;
    if (selectedShowFilter?.Category === CATEGORY_HALLTYPE) return showtime.hallType === selectedShowFilter.Keyword;
    if (selectedShowFilter?.Category === CATEGORY_FILMTYPE) return showtime.name.includes(selectedShowFilter.Keyword);
    return false;
  };

  const handleShowtimeError = (error: string) => {
    setErrorMessage(error);
    refetch();
    startTimer();
  };

  useEffect(() => {
    if (!responseData || !responseData.showtimes || !responseData.showFilters) return; // Ensure data is available
    const availableDatesSet = new Set<string>();
    Object.values(responseData.showtimes).forEach((showtimes: Showtime[]) => {
      showtimes.forEach((showtime: Showtime) => {
        if (new Date(showtime.showDateTime) > new Date()) {
          availableDatesSet.add(showtime.showDateTime.split("T")[0]);
        }
      });
    });

    const newAvailableDates = Array.from(availableDatesSet).sort();
    if (newAvailableDates.length > 0) {
      setAvailableDates(newAvailableDates);
    }

    if (responseData.showFilters.length > 0 && !selectedShowFilter) {
      handleShowFilterChange(responseData.showFilters[0]);
    }
    
    handleDateChange(new Date().toISOString().split('T')[0]);
  }, [responseData, handleDateChange]);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (isTimerActive) refetch();
    }, 10000);
  }, [isTimerActive, refetch]);

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTimer]);

  useEffect(() => {
    const handleVisibilityChange = () => setIsTimerActive(!document.hidden);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const filteredShowtimes = selectedDate && responseData?.showtimes && responseData?.showFilters
    ? Object.keys(responseData.showtimes).reduce<Record<string, Showtime[]>>((acc, filmCode) => {
        const filteredShowtimes = responseData.showtimes[filmCode].filter((showtime) => {
          const showDateTime = new Date(showtime.showDateTime);
          return isShowtimeInFilter(showtime) && showDateTime.toISOString().split('T')[0] === selectedDate && showDateTime >= now;
        });
        if (filteredShowtimes.length > 0) acc[filmCode] = filteredShowtimes;
        return acc;
      }, {})
    : responseData?.showtimes;

  return (
    <>
      <h1 className="text-2xl">Available showtimes</h1>
      {errorMessage && <div className="bg-red-500 text-white p-4 mb-4 rounded">{errorMessage}</div>}
      {isLoading ? (
        <ShowtimePageSkeletons />
      ) : error ? (
        <p className="text-red-500">Failed to load showtimes: {error.toString()}</p>
      ) : (
        <>
          {availableDates.length > 0 && (
            <DateSelector dates={availableDates} selectedDate={selectedDate} onDateChange={handleDateChange} />
          )}
          {responseData?.showFilters && responseData.showFilters.length > 0 && selectedShowFilter && (
            <ShowFilterSelector showFilters={responseData.showFilters} selectedShowFilter={selectedShowFilter} onFilterChange={handleShowFilterChange} />
          )}
          {filteredShowtimes && Object.keys(filteredShowtimes).length > 0 ? (
            Object.keys(filteredShowtimes)
              .filter((filmCode) => filteredShowtimes[filmCode].length > 0)
              .map((filmCode) => (
                <ShowtimeCard key={filmCode} showtimes={filteredShowtimes[filmCode]} onShowtimeError={handleShowtimeError} />
              ))
          ) : (
            <p>No showtimes available for the selected date.</p>
          )}
        </>
      )}
    </>
  );
}