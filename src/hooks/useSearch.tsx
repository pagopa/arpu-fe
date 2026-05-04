import { useEffect } from 'react';
import { UseMutationResult } from '@tanstack/react-query';
import utils from '../utils';
import { useHashParamsListener } from './useHashParamsListener';

export type SearchVariables<T> = {
  filters?: T;
  pagination: { page: number; size: number };
  sort: Array<string>;
};

export type UseSearchProps<T, TData = unknown, TError = unknown> = {
  filters?: T;
  initialPagination?: { page: number; size: number };
  initialSort?: Array<string>;
  query: UseMutationResult<TData, TError, SearchVariables<T>>;
};

const DEFAULT_SIZE = 5;
const DEFAULT_PAGE = 1;

/**
 * React Hook for managing search interfaces with filter state,
 * pagination (with URL hash sync), and sort, performing query on changes.
 */
export function useSearch<T, TData = unknown, TError = unknown>({
  filters,
  initialPagination: { page: initialPage, size: initialSize } = {
    page: DEFAULT_PAGE,
    size: DEFAULT_SIZE
  },
  initialSort = [],
  query
}: UseSearchProps<T, TData, TError>) {
  // Read hash params, initialize with props if missing
  const {
    page = initialPage,
    size = initialSize,
    sort = initialSort
  } = useHashParamsListener() as {
    page: number;
    size: number;
    sort: string[];
  };

  // Perform query when hash params change
  useEffect(() => {
    query.mutateAsync({
      filters,
      pagination: { size, page: page - 1 },
      sort
    });
  }, [page, size]);

  // Handle filter application: resetting pagination and sort model
  const applyFilters = (appliedFilters?: T) => {
    const params = utils.URI.encode({
      page: null,
      size: null,
      sort,
      ...appliedFilters
    });
    utils.URI.set(params, { replace: true });

    // Perform query, resetting page
    query.mutateAsync({
      filters: appliedFilters,
      pagination: { size, page: initialPage - 1 },
      sort
    });
  };

  return {
    applyFilters,
    query
  };
}
