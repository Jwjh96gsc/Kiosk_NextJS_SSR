import { configureStore } from '@reduxjs/toolkit';
import { showtimeApiSlice } from './features/api/showtimeApiSlice';
import selectedDateReducer  from '@/app/lib/features/transaction/selectedDateSlice';
import selectedSeatsReducer  from '@/app/lib/features/transaction/selectedSeatsSlice';
import selectedTicketsReducer from '@/app/lib/features/transaction/selectedTicketsSlice';

export const makeStore = () => {
  return configureStore({
    reducer: {
       selectedDate: selectedDateReducer,
       selectedSeats: selectedSeatsReducer,
       selectedTickets: selectedTicketsReducer,
       [showtimeApiSlice.reducerPath]: showtimeApiSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(showtimeApiSlice.middleware)
})
}

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
