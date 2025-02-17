import { ShowFilter } from "./ShowFilter";
import { Showtime } from "./Showtime";

export interface ShowtimesResponse {
	showtimes: Record<string, Showtime[]>;
	showFilters: ShowFilter[];
}

export interface ShowtimeApiResponse {
	ShowDate: string;
	ShowTime: string;
	FilmCode: string;
	FilmPoster: string;
	FilmName: string;
	HallCode: string;
	HallType: string;
	FilmLanguage: string;
	ShowId: string;
  }