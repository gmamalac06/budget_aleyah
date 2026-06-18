import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@fontsource-variable/manrope';
import '@fontsource-variable/fraunces';
import App from './app/App';
import { AppDataProvider } from './app/AppDataProvider';
import './styles/index.css';

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity, retry: false } } });

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppDataProvider><App /></AppDataProvider>
    </QueryClientProvider>
  </StrictMode>,
);
