import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, renderHook, RenderHookOptions, RenderOptions } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { it } from 'date-fns/locale/it';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { StoreProvider } from '../store/GlobalStore';
import React from 'react';
import { Theme } from 'utils/style';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <MemoryRouter>
      <QueryClientProvider client={queryClient}>
        <StoreProvider>
          <LocalizationProvider adapterLocale={it}>
            <Theme>{children}</Theme>
          </LocalizationProvider>
        </StoreProvider>
      </QueryClientProvider>
    </MemoryRouter>
  );
};

const customRender = (ui: React.ReactNode, options?: RenderOptions) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// Custom renderHook function
const customRenderHook = <TProps, TResult>(
  callback: (props: TProps) => TResult,
  options?: RenderHookOptions<TProps>
) => renderHook(callback, { wrapper: AllTheProviders, ...options });

// re-export everything
export * from '@testing-library/react';

// override render method
export { customRender as render };
export { customRenderHook as renderHook };
