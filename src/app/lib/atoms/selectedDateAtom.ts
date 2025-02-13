import { atom } from 'jotai';

export const selectedDateAtom = atom<string>(new Date().toISOString().split('T')[0]);
export const selectedSeatsAtom = atom<any[]>([]);