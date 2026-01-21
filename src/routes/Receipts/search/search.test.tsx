import React from 'react';
import { render, screen, fireEvent, waitFor } from '__tests__/renderers';
import '@testing-library/jest-dom';
import { ReceiptsSearch } from '.';
import utils from 'utils';
import { Mock } from 'vitest';

vi.mock('components/BackButton', () => ({
  BackButton: () => <button data-testid="back-button">Back</button>
}));

vi.mock('./components/results', () => ({
  Results: () => <div data-testid="results-component">Results</div>
}));

vi.mock('utils', () => ({
  default: {
    storage: {
      app: {
        getBrokerId: vi.fn(() => 123)
      }
    },
    loaders: {
      public: {
        usePublicInstallmentsByIuvOrNav: vi.fn()
      }
    },
    notify: {
      emit: vi.fn()
    }
  }
}));

describe('ReceiptsSearch', () => {
  const mockMutateAsync = vi.fn();

  beforeEach(() => {
    (utils.loaders.public.usePublicInstallmentsByIuvOrNav as Mock).mockReturnValue({
      mutateAsync: mockMutateAsync,
      data: undefined
    });
    mockMutateAsync.mockResolvedValue([]);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders form with both tabs', () => {
    render(<ReceiptsSearch />);

    expect(screen.getByText('common.person')).toBeInTheDocument();
    expect(screen.getByText('common.company')).toBeInTheDocument();
  });

  it('switches between fiscal code and PIVA field', () => {
    render(<ReceiptsSearch />);

    expect(screen.getByLabelText('fields.fiscalcode')).toBeInTheDocument();

    fireEvent.click(screen.getByText('common.company'));

    expect(screen.getByLabelText('fields.piva')).toBeInTheDocument();
  });

  it('disables fiscal code when anonymous is checked', () => {
    render(<ReceiptsSearch />);

    const fiscalCodeField = screen.getByLabelText('fields.fiscalcode');
    const anonymousCheckbox = screen.getByRole('checkbox');

    fireEvent.click(anonymousCheckbox);

    expect(fiscalCodeField).toBeDisabled();
  });

  it('submits form with values', async () => {
    render(<ReceiptsSearch />);

    fireEvent.change(screen.getByLabelText('fields.iuv'), {
      target: { value: '123456789012345678' }
    });
    fireEvent.change(screen.getByLabelText('fields.fiscalcode'), {
      target: { value: 'RSSMRA80A01H501U' }
    });

    fireEvent.click(screen.getByText('actions.search'));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        iuvOrNav: '123456789012345678',
        fiscalCode: 'RSSMRA80A01H501U'
      });
    });
  });

  it('submits with ANONIMO when anonymous is checked', async () => {
    render(<ReceiptsSearch />);

    fireEvent.change(screen.getByLabelText('fields.iuv'), {
      target: { value: '123456789012345678' }
    });
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByText('actions.search'));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        iuvOrNav: '123456789012345678',
        fiscalCode: 'ANONIMO'
      });
    });
  });

  it('shows error on mutation failure', async () => {
    mockMutateAsync.mockRejectedValue(new Error('Failed'));

    render(<ReceiptsSearch />);

    fireEvent.change(screen.getByLabelText('fields.iuv'), {
      target: { value: '123456789012345678' }
    });
    fireEvent.change(screen.getByLabelText('fields.fiscalcode'), {
      target: { value: 'RSSMRA80A01H501U' }
    });
    fireEvent.click(screen.getByText('actions.search'));

    await waitFor(() => {
      expect(utils.notify.emit).toHaveBeenCalledWith('app.receiptsSearch.searchError');
    });
  });
});
