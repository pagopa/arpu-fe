import { render, screen, fireEvent } from '@testing-library/react';
import utils from '../../utils';
import { CustomDataGrid } from './CustomDataGrid';
import React from 'react';

vi.mock('../../utils', () => ({
  default: {
    URI: {
      encode: vi.fn(() => 'encodedParams'),
      set: vi.fn()
    }
  }
}));

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
      sortField: undefined,
      sortDirection: undefined
    });
  });

  it('renders grid with rows and columns', () => {
    render(<CustomDataGrid rows={rows} columns={columns} totalPages={3} />);

    expect(screen.getByRole('grid')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('uses initial sort model when no hash params', () => {
    render(
      <CustomDataGrid
        rows={rows}
        columns={columns}
        totalPages={3}
        initialSortModel={[{ field: 'id', sort: 'asc' }]}
      />
    );

    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('reads sort from hash params', () => {
    mockUseHashParamsListener.mockReturnValue({
      page: 1,
      size: 10,
      sortField: 'name',
      sortDirection: 'desc'
    });

    render(<CustomDataGrid rows={rows} columns={columns} totalPages={3} />);

    expect(screen.getByRole('grid')).toBeInTheDocument();
  });

  it('updates hash params on sort change', () => {
    render(<CustomDataGrid rows={rows} columns={columns} totalPages={3} />);

    const idHeader = screen.getByRole('columnheader', { name: /id/i });
    fireEvent.click(idHeader);

    expect(utils.URI.encode).toHaveBeenCalled();
    expect(utils.URI.set).toHaveBeenCalledWith('encodedParams');
  });
});
