/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import utils from 'utils';
import React from 'react';
import loaders from './loaders';

vi.mock('utils', () => ({
  default: {
    arpuBeApiClient: {
      brokers: {
        getPagedDebtorReceipts: vi.fn()
      }
    }
  }
}));
