"use client"; // Mark this as a Client Component

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Provider as JotaiProvider } from 'jotai';

const queryClient = new QueryClient();

export default function Providers({ children }: any) {
  return (
    <QueryClientProvider client={queryClient}>
      <JotaiProvider>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </JotaiProvider>
    </QueryClientProvider>
  );
}