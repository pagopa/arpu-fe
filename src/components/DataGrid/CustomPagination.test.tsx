import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CustomPagination from './CustomPagination';
import React from 'react';

describe('CustomPagination Component', () => {
  const onPageChangeMock = vi.fn();
  const onPageSizeChangeMock = vi.fn();

  const defaultProps = {
    sizePageOptions: [10, 20, 50],
    defaultPageOption: 20,
    totalPages: 5,
    currentPage: 3,
    onPageChange: onPageChangeMock,
    onPageSizeChange: onPageSizeChangeMock
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Pagination with correct current page and total pages', () => {
    render(<CustomPagination {...defaultProps} />);
    const pagination = screen.getByRole('navigation');
    expect(pagination).toBeInTheDocument();
    // Current page displayed should be 3
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('hides previous button on first page', () => {
    render(<CustomPagination {...defaultProps} currentPage={1} totalPages={5} />);
    // Previous button should not be in the document
    expect(screen.queryByLabelText(/previous page/i)).not.toBeInTheDocument();
    // Next button should be visible
    expect(screen.getByLabelText(/next page/i)).toBeInTheDocument();
  });

  it('hides next button on last page', () => {
    render(<CustomPagination {...defaultProps} currentPage={5} totalPages={5} />);
    // Next button should not show
    expect(screen.queryByLabelText(/next page/i)).not.toBeInTheDocument();
    // Previous button should be visible
    expect(screen.getByLabelText(/previous page/i)).toBeInTheDocument();
  });
});
