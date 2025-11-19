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
  initialPage?: number;
  initialSize?: number;
  query: UseMutationResult<TData, TError, SearchVariables<T>>;
};

/**
 * React Hook for managing search interfaces with filter state,
 * pagination (with URL hash sync), and sort, performing query on changes.
 */
export function useSearch<T, TData = unknown, TError = unknown>({
  filters,
  query,
  initialPage = 0,
  initialSize = 10
}: UseSearchProps<T, TData, TError>) {
  const {
    page: hashPage,
    size: hashSize,
    sortDirection,
    sortField
  } = useHashParamsListener() as {
    page: number;
    size: number;
    sortDirection: string;
    sortField: string;
  };

  const page = hashPage ? hashPage - 1 : initialPage;
  const size = hashSize ?? initialSize;
  const sort = sortDirection && sortField ? [`${sortField},${sortDirection}`] : [];

  useEffect(() => {
    query.mutateAsync({
      filters,
      pagination: { size, page },
      sort
    });
  }, [page, size, sortDirection, sortField]);

  // Handle filter application: resetting pagination and sort model
  const applyFilters = (appliedFilters?: T) => {
    const params = utils.URI.encode({
      ...appliedFilters,
      page: initialPage,
      size: initialSize,
      sort: null
    });
    utils.URI.set(params, { replace: true });
    query.mutateAsync({
      filters: appliedFilters,
      pagination: { size: initialSize, page: initialPage },
      sort: []
    });
  };

  return {
    applyFilters,
    query
  };
}
