import React from 'react';
import '@preact/signals-react/auto';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StoreProvider } from 'store/GlobalStore';
import Matomo from 'components/Matomo';
import CookieBanner from 'components/CookieBanner';

const container = document.getElementById('root');
const root = createRoot(container!);

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      console.error('Query error:', error);
    }
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      console.error('Mutation error:', error);
    }
  })
});

root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <StoreProvider>
        <Matomo />
        <CookieBanner />
        <App />
      </StoreProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
