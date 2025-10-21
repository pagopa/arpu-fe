import React from 'react';
import utils from 'utils';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { PaymentNotice } from './index';
import { i18nTestSetup } from '__tests__/i18nTestSetup';
import { ArcRoutes } from 'routes/routes';
import { Signal } from '@preact/signals-react';
import { useMediaQuery } from '@mui/material';
import { Mock } from 'vitest';

i18nTestSetup({});

vi.mock('@pagopa/mui-italia', async () => {
  const muiItalia = await vi.importActual('@pagopa/mui-italia');
  const IllusSharingInfo = vi.fn(() => <div>Illustration</div>);
  return {
    ...muiItalia,
    IllusSharingInfo
  };
});

vi.mock(import('@mui/material'), async (importOriginal) => ({
  ...(await importOriginal()),
  useMediaQuery: vi.fn()
}));

const navigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => navigate
}));

vi.mock('utils');

describe('PaymentNotice.Preview Component', () => {
  const renderWithTheme = (ui: React.ReactElement) => {
    const theme = createTheme();
    return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
  };

  it('renders the title and description', () => {
    renderWithTheme(<PaymentNotice.Preview />);

    expect(screen.getByText('app.paymentNotice.preview.title')).toBeInTheDocument();
    expect(screen.getByText('app.paymentNotice.preview.description')).toBeInTheDocument();
  });

  it('renders the action button', () => {
    renderWithTheme(<PaymentNotice.Preview />);

    expect(screen.getByText('app.paymentNotice.preview.action')).toBeInTheDocument();
  });

  it('renders the illustration on large screens', () => {
    (useMediaQuery as Mock).mockReturnValue(true);
    renderWithTheme(<PaymentNotice.Preview />);
    expect(screen.getByText('Illustration')).toBeInTheDocument();
  });

  it('does not render the illustration on small screens', () => {
    (useMediaQuery as Mock).mockReturnValue(false);
    renderWithTheme(<PaymentNotice.Preview />);
    expect(screen.queryByText('Illustration')).not.toBeInTheDocument();
  });

  it('Call use navigate on CTA click if the user did the opt-in', () => {
    vi.spyOn(utils.storage.pullPaymentsOptIn, 'get').mockReturnValue({
      value: true
    } as Signal<boolean>);

    renderWithTheme(<PaymentNotice.Preview />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(utils.modal.open).not.toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith(ArcRoutes.PAYMENT_NOTICES);
  });

  it('Open a modal on CTA click if the user needs to do the opt-in', () => {
    vi.spyOn(utils.storage.pullPaymentsOptIn, 'get').mockReturnValue({
      value: false
    } as Signal<boolean>);

    renderWithTheme(<PaymentNotice.Preview />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(utils.modal.open).toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });
});
