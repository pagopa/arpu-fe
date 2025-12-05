import { render, screen, fireEvent } from '@testing-library/react';
import CustomPagination from './CustomPagination';
import utils from '../../utils';
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

describe('CustomPagination', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseHashParamsListener.mockReturnValue({
      page: 3,
      size: 10
    });
  });

  it('renders pagination with correct page', () => {
    render(<CustomPagination totalPages={5} />);

    const pagination = screen.getByRole('navigation');
    expect(pagination).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders page size select', () => {
    render(<CustomPagination totalPages={5} sizePageOptions={[5, 10, 20]} />);

    expect(screen.getByTestId('result-set-select')).toBeInTheDocument();
  });

  it('hides previous button on first page', () => {
    mockUseHashParamsListener.mockReturnValue({
      page: 1,
      size: 10
    });

    render(<CustomPagination totalPages={5} />);

    expect(screen.queryByLabelText(/previous page/i)).not.toBeInTheDocument();
  });

  it('hides next button on last page', () => {
    mockUseHashParamsListener.mockReturnValue({
      page: 5,
      size: 10
    });

    render(<CustomPagination totalPages={5} />);

    expect(screen.queryByLabelText(/next page/i)).not.toBeInTheDocument();
  });

  it('updates hash params on page change', () => {
    mockUseHashParamsListener.mockReturnValue({
      page: 2,
      size: 10
    });

    render(<CustomPagination totalPages={5} />);

    const nextButton = screen.getByLabelText(/next page/i);
    fireEvent.click(nextButton);

    expect(utils.URI.encode).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 3,
        size: 10
      })
    );
    expect(utils.URI.set).toHaveBeenCalledWith('encodedParams');
  });

  it('uses initial values when hash params are missing', () => {
    mockUseHashParamsListener.mockReturnValue({});

    render(<CustomPagination totalPages={5} initialPage={1} initialPageSize={5} />);

    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });
});
