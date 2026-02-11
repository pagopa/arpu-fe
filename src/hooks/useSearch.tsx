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

/**
 * React Hook for managing search interfaces with filter state,
 * pagination (with URL hash sync), and sort, performing query on changes.
 */
export function useSearch<T, TData = unknown, TError = unknown>({
  filters,
  initialPagination,
  initialSort,
  query
}: UseSearchProps<T, TData, TError>) {
  const {
    page = initialPagination?.page ?? 0,
    size = initialPagination?.size ?? 5,
    sort = initialSort ?? []
  } = useHashParamsListener() as {
    page: number;
    size: number;
    sort: string[];
  };

  useEffect(() => {
    query.mutateAsync({
      filters,
      pagination: { size, page },
      sort
    });
  }, [page, size]);

  // Handle filter application: resetting pagination and sort model
  const applyFilters = (appliedFilters?: T) => {
    console.debug(sort);
    const params = utils.URI.encode({
      page: null,
      size: null,
      sort,
      ...appliedFilters
    });
    console.debug(sort, initialSort);
    utils.URI.set(params, { replace: true });
    query.mutateAsync({
      filters: appliedFilters,
      pagination: initialPagination ?? { size: 5, page: 0 },
      sort
    });
  };

  return {
    applyFilters,
    query
  };
}
