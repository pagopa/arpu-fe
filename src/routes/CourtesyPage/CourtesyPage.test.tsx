import React from 'react';
import { screen } from '@testing-library/react';
import { CourtesyPage, ErrorIconComponent } from '.';
import { ArcErrors, ArpuOutcome } from 'routes/routes';

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useParams: vi.fn() };
});

import { useParams } from 'react-router-dom';
import { i18nTestSetup } from '__tests__/i18nTestSetup';
import { render } from '__tests__/renderers';

const SESSION_EXPIRED_CODE = ArcErrors['sessione-scaduta'];

i18nTestSetup({
  courtesyPage: {
    default: {
      title: 'Default title',
      body: 'Default body'
    },
    [SESSION_EXPIRED_CODE]: {
      title: 'Session expired',
      body: 'Your session has expired.',
      cta: 'Log in again'
    }
  }
});

const renderCourtesyPage = (param?: { error?: string; outcome?: string }) => {
  vi.mocked(useParams).mockReturnValue(param ?? {});
  return render(<CourtesyPage />);
};

describe('ErrorIconComponent', () => {
  afterEach(() => vi.clearAllMocks());

  it('renders the "OK" pictogram for PAGAMENTO_AVVISO_COMPLETATO', () => {
    render(<ErrorIconComponent code={ArpuOutcome.PAGAMENTO_AVVISO_COMPLETATO} />);
    const img = screen.getByTitle('OK');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/cittadini/pictograms/paymentcompleted.svg');
  });

  it('renders the "Error" pictogram for accesso-non-autorizzato', () => {
    render(<ErrorIconComponent code={ArcErrors['accesso-non-autorizzato']} />);
    const img = screen.getByTitle('Error');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/cittadini/pictograms/genericerror.svg');
  });

  it('renders the "Error" pictogram for avviso-non-pagabile', () => {
    render(<ErrorIconComponent code={ArcErrors['avviso-non-pagabile']} />);
    const img = screen.getByTitle('Error');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/cittadini/pictograms/genericerror.svg');
  });

  it('renders the "Expired" pictogram for sessione-scaduta', () => {
    render(<ErrorIconComponent code={ArcErrors['sessione-scaduta']} />);
    const img = screen.getByTitle('Expired');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/cittadini/pictograms/expired.svg');
  });

  it('renders the umbrella pictogram for risorsa-non-trovata (falls to default)', () => {
    render(<ErrorIconComponent code={ArcErrors['risorsa-non-trovata']} />);
    const img = screen.getByTitle('Something went wrong');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/cittadini/pictograms/umbrella.svg');
  });

  it('renders the umbrella pictogram for avvio-pagamento', () => {
    render(<ErrorIconComponent code={ArcErrors['avvio-pagamento']} />);
    const img = screen.getByTitle('Something went wrong');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/cittadini/pictograms/umbrella.svg');
  });

  it('renders the umbrella pictogram for sconosciuto', () => {
    render(<ErrorIconComponent code={ArcErrors['sconosciuto']} />);
    const img = screen.getByTitle('Something went wrong');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/cittadini/pictograms/umbrella.svg');
  });

  it('renders the umbrella pictogram when no code is provided (default branch)', () => {
    render(<ErrorIconComponent />);
    const img = screen.getByTitle('Something went wrong');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/cittadini/pictograms/umbrella.svg');
  });
});

describe('CourtesyPage', () => {
  afterEach(() => vi.clearAllMocks());

  it('renders title and body when no params are present', () => {
    renderCourtesyPage();
    expect(screen.getByTestId('courtesyPage.title')).toBeInTheDocument();
    expect(screen.getByTestId('courtesyPage.body')).toBeInTheDocument();
  });

  it('shows default text when param is unrecognised', () => {
    renderCourtesyPage({ error: 'codice-inesistente' });
    expect(screen.getByTestId('courtesyPage.title')).toHaveTextContent('Default title');
    expect(screen.getByTestId('courtesyPage.body')).toHaveTextContent('Default body');
  });

  it('resolves an error param and renders the correct icon', () => {
    renderCourtesyPage({ error: 'sessione-scaduta' });
    expect(screen.getByTitle('Expired')).toBeInTheDocument();
  });

  it('shows translated text for a known error param', () => {
    renderCourtesyPage({ error: 'sessione-scaduta' });
    expect(screen.getByTestId('courtesyPage.title')).toHaveTextContent('Session expired');
    expect(screen.getByTestId('courtesyPage.body')).toHaveTextContent('Your session has expired.');
  });

  it('resolves an outcome param and renders the correct icon', () => {
    renderCourtesyPage({ outcome: ArpuOutcome.PAGAMENTO_AVVISO_COMPLETATO });
    expect(screen.getByTitle('OK')).toBeInTheDocument();
  });

  it('prefers "error" over "outcome" when both params are present', () => {
    renderCourtesyPage({
      error: 'sessione-scaduta',
      outcome: ArpuOutcome.PAGAMENTO_AVVISO_COMPLETATO
    });
    expect(screen.getByTitle('Expired')).toBeInTheDocument();
  });

  it('does NOT render the CTA when the translation key is absent', () => {
    renderCourtesyPage({ error: 'codice-inesistente' });
    expect(screen.queryByTestId('courtesyPage.cta')).not.toBeInTheDocument();
  });

  it('renders the CTA with correct text when the translation key exists', () => {
    renderCourtesyPage({ error: 'sessione-scaduta' });
    const cta = screen.getByTestId('courtesyPage.cta');
    expect(cta).toBeInTheDocument();
    expect(cta).toHaveTextContent('Log in again');
  });
});
