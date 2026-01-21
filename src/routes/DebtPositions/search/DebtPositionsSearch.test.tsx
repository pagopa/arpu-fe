import React from 'react';
import { render, screen, fireEvent, waitFor } from '__tests__/renderers';
import '@testing-library/jest-dom';
import { DebtPositionsSearch } from '.';

vi.mock('components/BackButton', () => ({
  BackButton: () => <button data-testid="back-button">Back</button>
}));

describe('DebtPositionsSearch', () => {
  it('renders form with both tabs', () => {
    render(<DebtPositionsSearch />);
    expect(screen.getByText('common.person')).toBeInTheDocument();
    expect(screen.getByText('common.company')).toBeInTheDocument();
  });

  it('switches between fiscal code and PIVA field', () => {
    render(<DebtPositionsSearch />);
    expect(screen.getByLabelText('fields.fiscalcode')).toBeInTheDocument();

    fireEvent.click(screen.getByText('common.company'));

    expect(screen.getByLabelText('fields.piva')).toBeInTheDocument();
  });

  it('disables fiscal code when anonymous is checked', () => {
    render(<DebtPositionsSearch />);
    const fiscalCodeField = screen.getByLabelText('fields.fiscalcode');
    const anonymousCheckbox = screen.getByRole('checkbox');

    fireEvent.click(anonymousCheckbox);

    expect(fiscalCodeField).toBeDisabled();
  });

  it('clears fiscal code and anonymous when switching tabs', () => {
    render(<DebtPositionsSearch />);

    // Fill fiscal code and check anonymous
    fireEvent.change(screen.getByLabelText('fields.fiscalcode'), {
      target: { value: 'RSSMRA80A01H501U' }
    });
    fireEvent.click(screen.getByRole('checkbox'));

    // Switch to company tab
    fireEvent.click(screen.getByText('common.company'));

    // Switch back to person tab
    fireEvent.click(screen.getByText('common.person'));

    // Check that fiscal code is cleared and anonymous is unchecked
    expect(screen.getByLabelText('fields.fiscalcode')).toHaveValue('');
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('shows validation errors when submitting empty form', async () => {
    render(<DebtPositionsSearch />);

    fireEvent.click(screen.getByText('actions.search'));

    await waitFor(() => {
      expect(screen.getAllByText('errors.form.required')).toHaveLength(2); // iuv and fisca
    });
  });

  it('shows validation error for iuv when empty', async () => {
    render(<DebtPositionsSearch />);

    fireEvent.change(screen.getByLabelText('fields.fiscalcode'), {
      target: { value: 'RSSMRA80A01H501U' }
    });

    fireEvent.click(screen.getByText('actions.search'));

    await waitFor(() => {
      const iuvField = screen.getByLabelText('fields.iuv');
      expect(iuvField).toHaveAttribute('aria-invalid', 'true');
    });
  });

  it('shows validation error for fiscal code when not anonymous and empty', async () => {
    render(<DebtPositionsSearch />);

    fireEvent.change(screen.getByLabelText('fields.iuv'), {
      target: { value: '123456789012345678' }
    });

    fireEvent.click(screen.getByText('actions.search'));

    await waitFor(() => {
      const fiscalCodeField = screen.getByLabelText('fields.fiscalcode');
      expect(fiscalCodeField).toHaveAttribute('aria-invalid', 'true');
    });
  });

  it('does not show validation error for fiscal code when anonymous is checked', async () => {
    render(<DebtPositionsSearch />);

    fireEvent.change(screen.getByLabelText('fields.iuv'), {
      target: { value: '123456789012345678' }
    });

    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByText('actions.search'));

    await waitFor(() => {
      const fiscalCodeField = screen.getByLabelText('fields.fiscalcode');
      expect(fiscalCodeField).not.toHaveAttribute('aria-invalid', 'true');
    });
  });

  it('hides anonymous checkbox on company tab', () => {
    render(<DebtPositionsSearch />);

    expect(screen.getByRole('checkbox')).toBeInTheDocument();

    fireEvent.click(screen.getByText('common.company'));

    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });

  it('validates form on submit', async () => {
    render(<DebtPositionsSearch />);

    fireEvent.change(screen.getByLabelText('fields.iuv'), {
      target: { value: '123456789012345678' }
    });

    fireEvent.change(screen.getByLabelText('fields.fiscalcode'), {
      target: { value: 'RSSMRA80A01H501U' }
    });

    fireEvent.click(screen.getByText('actions.search'));

    await waitFor(() => {
      const iuvField = screen.getByLabelText('fields.iuv');
      const fiscalCodeField = screen.getByLabelText('fields.fiscalcode');
      expect(iuvField).not.toHaveAttribute('aria-invalid', 'true');
      expect(fiscalCodeField).not.toHaveAttribute('aria-invalid', 'true');
    });
  });
});
