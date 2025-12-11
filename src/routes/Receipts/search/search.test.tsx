import React from 'react';
import { render, screen, fireEvent } from '__tests__/renderers';
import '@testing-library/jest-dom';
import { ReceiptsSearch } from '.';

vi.mock('components/BackButton', () => ({
  BackButton: () => <button data-testid="back-button">Back</button>
}));

describe('ReceiptsSearch', () => {
  it('renders form with title and description', () => {
    render(<ReceiptsSearch />);

    expect(screen.getByText('app.receiptsSearch.title')).toBeInTheDocument();
    expect(screen.getByText('app.receiptsSearch.description')).toBeInTheDocument();
  });

  it('renders both tabs', () => {
    render(<ReceiptsSearch />);

    expect(screen.getByText('app.receiptsSearch.tab1.label')).toBeInTheDocument();
    expect(screen.getByText('app.receiptsSearch.tab2.label')).toBeInTheDocument();
  });

  it('shows fiscal code field on first tab', () => {
    render(<ReceiptsSearch />);

    expect(screen.getByLabelText('app.receiptsSearch.fields.fiscalcode')).toBeInTheDocument();
  });

  it('shows PIVA field on second tab', () => {
    render(<ReceiptsSearch />);

    const tab2 = screen.getByText('app.receiptsSearch.tab2.label');
    fireEvent.click(tab2);

    expect(screen.getByLabelText('app.receiptsSearch.fields.piva')).toBeInTheDocument();
  });

  it('shows anonymous checkbox only on first tab', () => {
    render(<ReceiptsSearch />);

    expect(screen.getByText('app.receiptsSearch.fields.anonymous')).toBeInTheDocument();

    const tab2 = screen.getByText('app.receiptsSearch.tab2.label');
    fireEvent.click(tab2);

    expect(screen.queryByText('app.receiptsSearch.fields.anonymous')).not.toBeInTheDocument();
  });

  it('disables fiscal code field when anonymous is checked', () => {
    render(<ReceiptsSearch />);

    const fiscalCodeField = screen.getByLabelText('app.receiptsSearch.fields.fiscalcode');
    const anonymousCheckbox = screen.getByRole('checkbox');

    expect(fiscalCodeField).not.toBeDisabled();

    fireEvent.click(anonymousCheckbox);

    expect(fiscalCodeField).toBeDisabled();
  });

  it('changes tab description when switching tabs', () => {
    render(<ReceiptsSearch />);

    expect(screen.getByText('app.receiptsSearch.tab1.description')).toBeInTheDocument();

    const tab2 = screen.getByText('app.receiptsSearch.tab2.label');
    fireEvent.click(tab2);

    expect(screen.queryByText('app.receiptsSearch.tab1.description')).not.toBeInTheDocument();
    expect(screen.getByText('app.receiptsSearch.tab2.description')).toBeInTheDocument();
  });

  it('renders IUV field', () => {
    render(<ReceiptsSearch />);

    expect(screen.getByLabelText('app.receiptsSearch.fields.iuv')).toBeInTheDocument();
  });

  it('renders submit button', () => {
    render(<ReceiptsSearch />);

    expect(screen.getByText('app.receiptsSearch.action')).toBeInTheDocument();
  });

  it('updates form values on input change', () => {
    render(<ReceiptsSearch />);

    const iuvField = screen.getByLabelText('app.receiptsSearch.fields.iuv');
    fireEvent.change(iuvField, { target: { value: '123456' } });

    expect(iuvField).toHaveValue('123456');
  });

  it('renders back button', () => {
    render(<ReceiptsSearch />);

    expect(screen.getByTestId('back-button')).toBeInTheDocument();
  });
});
