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

  const setup = (hashParams = { page: 1, size: 10, sortDirection: '', sortField: '' }) => {
    mockUseHashParamsListener.mockReturnValue({
      page: hashParams.page,
      size: hashParams.size,
      sortDirection: hashParams.sortDirection,
      sortField: hashParams.sortField
    });

    return renderHook(() =>
      useSearch({
        filters: { foo: 'bar' },
        query: { mutateAsync: mutateAsyncMock } as any
      })
    );
  };

  it('calls mutateAsync on mount with correct initial params', () => {
    setup();

    expect(mutateAsyncMock).toHaveBeenCalledWith({
      filters: { foo: 'bar' },
      pagination: { size: 10, page: 0 }, // page=hashPage -1 = 1-1=0
      sort: []
    });
  });

  it('calls mutateAsync with sorted params from hash', () => {
    setup({
      page: 2,
      size: 20,
      sortDirection: 'asc',
      sortField: 'name'
    });

    expect(mutateAsyncMock).toHaveBeenCalledWith({
      filters: { foo: 'bar' },
      pagination: { size: 20, page: 1 }, // 2-1=1
      sort: ['name,asc']
    });
  });

  it('calls mutateAsync again on hash param change', () => {
    const { rerender } = setup({ page: 1 });

    expect(mutateAsyncMock).toHaveBeenCalledTimes(1);

    mockUseHashParamsListener.mockReturnValue({
      page: 3,
      size: 10,
      sortDirection: '',
      sortField: ''
    });

    rerender();

    expect(mutateAsyncMock).toHaveBeenCalledTimes(2);
    expect(mutateAsyncMock).toHaveBeenLastCalledWith({
      filters: { foo: 'bar' },
      pagination: { size: 10, page: 2 },
      sort: []
    });
  });

  it('applyFilters resets pagination and sort and calls URI encode/set and mutateAsync', () => {
    const { result } = setup();

    act(() => {
      result.current.applyFilters({ foo: 'baz' });
    });

    expect(utils.URI.encode).toHaveBeenCalledWith({
      foo: 'baz',
      page: null,
      size: null,
      sort: null
    });
    expect(utils.URI.set).toHaveBeenCalledWith('encodedParams', { replace: true });
    expect(mutateAsyncMock).toHaveBeenCalledWith({
      filters: { foo: 'baz' },
      pagination: { size: 10, page: 0 },
      sort: []
    });
  });
});
