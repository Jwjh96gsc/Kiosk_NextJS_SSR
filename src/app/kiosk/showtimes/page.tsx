'use client';

import { useEffect, useRef, useState } from "react";
import { useAtom } from "jotai";
import ShowtimeCard from "@/app/ui/components/showtimes/ShowtimeCard";
import { Showtime } from "@/app/types/showtimes/Showtime";
import DateSelector from "@/app/ui/components/showtimes/DateSelector";
import { useQuery } from "@tanstack/react-query";
import { selectedDateAtom } from "@/app/lib/atoms/selectedDateAtom";
import ShowFilterSelector from "@/app/ui/components/showtimes/ShowFilterSelector";
import { ShowFilter } from "@/app/types/showtimes/ShowFilter";
import ShowtimePageSkeletons from "@/app/ui/components/showtimes/ShowtimePageSkeletons";
import { GetShowtimesQueryResponse } from "@/app/types/showtimes/ShowtimeApi";

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

  const { data: responseData, error, isLoading, refetch } = useQuery({
    queryKey: ['showtimes', selectedDate],
    queryFn: async () => {
      const res = await fetch('/api/showtimes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ locationId: '268', oprndate: selectedDate }),
      });
    },
  }) as GetShowtimesQueryResponse;

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
  };

  const handleShowFilterChange = (showFilter: ShowFilter) => {
    setSelectedShowFilter(showFilter);
  };

  const isShowtimeInFilter = (showtime: Showtime): boolean => {
    if (selectedShowFilter?.category === CATEGORY_ALL) return true;
    if (selectedShowFilter?.category === CATEGORY_HALLTYPE) return showtime.hallType === selectedShowFilter.keyword;
    if (selectedShowFilter?.category === CATEGORY_FILMTYPE) return showtime.name.includes(selectedShowFilter.keyword);
    return false;
  };

  const handleShowtimeError = (error: string) => {
    setErrorMessage(error);
    refetch();
    startTimer();
  };

  useEffect(() => {
    if (responseData?.showtimes && responseData?.showFilters) {
      const availableDatesSet = new Set<string>();
      Object.values(responseData.showtimes).forEach((showtimes: Showtime[]) => {
        showtimes.forEach((showtime: Showtime) => {
          availableDatesSet.add(showtime.showDateTime.split("T")[0]);
        });
      });
      setAvailableDates(Array.from(availableDatesSet).sort());
      handleShowFilterChange(responseData?.showFilters[0]);
    }
    handleDateChange(new Date().toISOString().split('T')[0]);
  }, [responseData?.showtimes, responseData?.showFilters]);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (isTimerActive) refetch();
    }, 10000);
  };

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerActive, refetch]);

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
          {responseData?.showFilters && (
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