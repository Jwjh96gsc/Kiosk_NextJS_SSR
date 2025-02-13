import { Seat } from '@/app/types/seats/Seat';
import { Ticket } from '@/app/types/tickets/Ticket';
import { atom } from 'jotai';

export const selectedDateAtom = atom<string>(new Date().toISOString().split('T')[0]);