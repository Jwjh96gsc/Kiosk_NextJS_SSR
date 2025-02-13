import { ShowFilter } from "./ShowFilter";
import { Showtime } from "./Showtime";

export interface ShowtimesResponse {
	showtimes: Record<string, Showtime[]>;
	showFilters: ShowFilter[];
}