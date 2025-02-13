import { ShowFilter } from "./ShowFilter";
import { Showtime } from "./Showtime";

export interface ShowtimesResponse {
	showtimes: Record<string, Showtime[]>;
	showFilters: ShowFilter[];
}

export interface GetShowtimesQueryResponse { 
	data: ShowtimesResponse; 
	error: any; 
	isLoading: boolean;
	refetch: any;
}