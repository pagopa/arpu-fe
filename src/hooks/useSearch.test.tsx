/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSearch } from './useSearch';
import utils from '../utils';

// Mock utils.URI methods
vi.mock('../utils', () => ({
  default: {
    URI: {
      encode: vi.fn(() => 'encodedParams'),
      set: vi.fn()
    }
  }
}));

// Mock useHashParamsListener separately as needed
const mockUseHashParamsListener = vi.fn();
vi.mock('./useHashParamsListener', () => ({
  useHashParamsListener: () => mockUseHashParamsListener()
}));

describe('useSearch', () => {
  const mutateAsyncMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mutateAsyncMock.mockResolvedValue(undefined);
  });

  const setup = (
    hashParams: { page?: number; size?: number; sort?: string[] } = { page: 1, size: 5, sort: [] },
    hookProps: Record<string, any> = {}
  ) => {
    mockUseHashParamsListener.mockReturnValue({
      page: hashParams.page,
      size: hashParams.size,
      sort: hashParams.sort
    });

    return renderHook(() =>
      useSearch({
        filters: { foo: 'bar' },
        query: { mutateAsync: mutateAsyncMock } as any,
        ...hookProps
      })
    );
  };

  it('calls mutateAsync on mount with hash params', () => {
    setup({ page: 1, size: 5, sort: [] });

    expect(mutateAsyncMock).toHaveBeenCalledWith({
      filters: { foo: 'bar' },
      pagination: { size: 5, page: 0 },
      sort: []
    });
  });

  it('falls back to initialPagination and initialSort when hash params are absent', () => {
    // Return empty object from hash listener so defaults kick in
    mockUseHashParamsListener.mockReturnValue({});

    renderHook(() =>
      useSearch({
        filters: { foo: 'bar' },
        initialPagination: { page: 2, size: 10 },
        initialSort: ['createdAt,desc'],
        query: { mutateAsync: mutateAsyncMock } as any
      })
    );

    expect(mutateAsyncMock).toHaveBeenCalledWith({
      filters: { foo: 'bar' },
      pagination: { size: 10, page: 1 },
      sort: ['createdAt,desc']
    });
  });

  it('falls back to default pagination (page=1, size=5) and empty sort when nothing is provided', () => {
    mockUseHashParamsListener.mockReturnValue({});

    renderHook(() =>
      useSearch({
        filters: { foo: 'bar' },
        query: { mutateAsync: mutateAsyncMock } as any
      })
    );

    expect(mutateAsyncMock).toHaveBeenCalledWith({
      filters: { foo: 'bar' },
      pagination: { size: 5, page: 0 },
      sort: []
    });
  });

  it('calls mutateAsync with sort array from hash params', () => {
    setup({ page: 2, size: 20, sort: ['name,asc'] });

    expect(mutateAsyncMock).toHaveBeenCalledWith({
      filters: { foo: 'bar' },
      pagination: { size: 20, page: 1 },
      sort: ['name,asc']
    });
  });

  it('calls mutateAsync again when page changes in hash params', () => {
    const { rerender } = setup({ page: 1, size: 5, sort: [] });

    expect(mutateAsyncMock).toHaveBeenCalledTimes(1);

    mockUseHashParamsListener.mockReturnValue({ page: 3, size: 5, sort: [] });
    rerender();

    expect(mutateAsyncMock).toHaveBeenCalledTimes(2);
    expect(mutateAsyncMock).toHaveBeenLastCalledWith({
      filters: { foo: 'bar' },
      pagination: { size: 5, page: 2 },
      sort: []
    });
  });

  it('calls mutateAsync again when size changes in hash params', () => {
    const { rerender } = setup({ page: 1, size: 5, sort: [] });

    expect(mutateAsyncMock).toHaveBeenCalledTimes(1);

    mockUseHashParamsListener.mockReturnValue({ page: 1, size: 25, sort: [] });
    rerender();

    expect(mutateAsyncMock).toHaveBeenCalledTimes(2);
    expect(mutateAsyncMock).toHaveBeenLastCalledWith({
      filters: { foo: 'bar' },
      pagination: { size: 25, page: 0 },
      sort: []
    });
  });

  it('applyFilters encodes current sort, nullifies page/size, updates URI and calls mutateAsync', () => {
    const { result } = setup({ page: 1, size: 5, sort: ['name,asc'] });

    act(() => {
      result.current.applyFilters({ foo: 'baz' });
    });

    // sort is preserved from current state; page and size are nulled out
    expect(utils.URI.encode).toHaveBeenCalledWith({
      page: null,
      size: null,
      sort: ['name,asc'],
      foo: 'baz'
    });
    expect(utils.URI.set).toHaveBeenCalledWith('encodedParams', { replace: true });
    expect(mutateAsyncMock).toHaveBeenLastCalledWith({
      filters: { foo: 'baz' },
      pagination: { size: 5, page: 0 },
      sort: ['name,asc']
    });
  });

  it('applyFilters uses initialPage as reset target when provided', () => {
    mockUseHashParamsListener.mockReturnValue({ page: 3, size: 20, sort: [] });

    const { result } = renderHook(() =>
      useSearch({
        filters: { foo: 'bar' },
        initialPagination: { page: 1, size: 10 },
        query: { mutateAsync: mutateAsyncMock } as any
      })
    );

    act(() => {
      result.current.applyFilters({ foo: 'baz' });
    });

    expect(mutateAsyncMock).toHaveBeenLastCalledWith({
      filters: { foo: 'baz' },
      pagination: { size: 20, page: 0 },
      sort: []
    });
  });

  it('applyFilters with no argument passes undefined filters', () => {
    const { result } = setup();

    act(() => {
      result.current.applyFilters();
    });

    expect(mutateAsyncMock).toHaveBeenLastCalledWith({
      filters: undefined,
      pagination: { size: 5, page: 0 },
      sort: []
    });
  });

  it('returns applyFilters and query from the hook', () => {
    const { result } = setup();

    expect(result.current).toHaveProperty('applyFilters');
    expect(result.current).toHaveProperty('query');
    expect(typeof result.current.applyFilters).toBe('function');
  });
});
