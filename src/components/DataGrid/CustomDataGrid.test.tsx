import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import utils from '../../utils';
import { CustomDataGrid } from './CustomDataGrid';
import React from 'react';

// Mock your URI encode/set functions called during param updates
vi.mock('../../utils', () => ({
  default: {
    URI: {
      encode: vi.fn(() => 'encodedParams'),
      set: vi.fn()
    }
  }
}));

// Mock useHashParamsListener hook
const mockUseHashParamsListener = vi.fn();
vi.mock('../../hooks/useHashParamsListener', () => ({
  useHashParamsListener: () => mockUseHashParamsListener()
}));

describe('CustomDataGrid', () => {
  const columns = [
    { field: 'id', headerName: 'ID', width: 100 },
    { field: 'name', headerName: 'Name', width: 200 }
  ];
  const rows = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseHashParamsListener.mockReturnValue({
      page: 1,
      size: 10,
      sortField: '',
      sortDirection: ''
    });
  });

  it('renders grid with given rows and columns', () => {
    render(<CustomDataGrid rows={rows} columns={columns} totalPages={3} />);

    expect(screen.getByRole('grid')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('calls updateHashParams on sort model change', () => {
    const spyEncode = utils.URI.encode;
    const spySet = utils.URI.set;

    render(
      <CustomDataGrid
        rows={rows}
        columns={columns}
        totalPages={3}
        initialSortModel={[{ field: 'id', sort: 'asc' }]}
      />
    );

    // Simulate user clicking column header to sort descending
    const idHeader = screen.getByRole('columnheader', { name: /id/i });
    fireEvent.click(idHeader);

    expect(spyEncode).toHaveBeenCalled();
    expect(spySet).toHaveBeenCalledWith('encodedParams');
  });
});
