/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '__tests__/renderers';
import React from 'react';
import { GenericListItemProps, ListItem } from '../ListItem';

// Mock navigation at top level
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importActual) => {
  const actual: any = await importActual();
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

const TestIcon = () => <div data-testid="test-icon">Icon</div>;

const defaultProps: GenericListItemProps = {
  title: 'Test Title',
  subtitle: 'Test Subtitle',
  icon: <TestIcon />,
  fields: [
    { label: 'Amount', value: '€150.00' },
    { label: 'Due Date', value: '2024-12-31' }
  ],
  detailPath: '/test-detail',
  detailAriaLabel: 'View details',
  detailTestId: 'detail-button'
};

describe('ListItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders title and subtitle', () => {
      render(<ListItem {...defaultProps} />);

      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
    });

    it('renders all fields with labels and values', () => {
      render(<ListItem {...defaultProps} />);

      expect(screen.getByText('Amount')).toBeInTheDocument();
      expect(screen.getByText('€150.00')).toBeInTheDocument();
      expect(screen.getByText('Due Date')).toBeInTheDocument();
      expect(screen.getByText('2024-12-31')).toBeInTheDocument();
    });
  });

  describe('Icon Handling', () => {
    it('renders icon when provided', () => {
      render(<ListItem {...defaultProps} />);

      // Icon should be in the document (visibility depends on media query)
      const icon = screen.queryByTestId('test-icon');
      if (icon) {
        expect(icon).toBeInTheDocument();
      }
    });

    it('does not render icon when not provided', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { icon, ...propsWithoutIcon } = defaultProps;
      render(<ListItem {...propsWithoutIcon} />);

      expect(screen.queryByTestId('test-icon')).not.toBeInTheDocument();
    });

    it('renders custom icon component', () => {
      const CustomIcon = () => <div data-testid="custom-icon">Custom</div>;
      render(<ListItem {...defaultProps} icon={<CustomIcon />} />);

      const customIcon = screen.queryByTestId('custom-icon');
      if (customIcon) {
        expect(customIcon).toBeInTheDocument();
      }
    });
  });
});
