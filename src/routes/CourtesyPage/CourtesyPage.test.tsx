import React from 'react';
import { screen } from '@testing-library/react';
import { CourtesyPage, ErrorIconComponent } from '.';
import { OUTCOMES } from 'routes/routes';

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useParams: vi.fn(), useSearchParams: vi.fn() };
});

import { useParams, useSearchParams } from 'react-router-dom';
import { i18nTestSetup } from '__tests__/i18nTestSetup';
import { render } from '__tests__/renderers';

vi.mock('./components/CourtesyPageActions', () => ({
  CourtesyPageActions: ({ code }: { code: number }) => (
    <div data-testid="courtesyPageActions" data-code={code}>
      CourtesyPageActions mock
    </div>
  )
}));

const SESSION_EXPIRED_CODE = OUTCOMES['sessione-scaduta'];
const CHECKOUT_KO_CODE = OUTCOMES['pagamento-non-riuscito'];
const CANCELLED_CODE = OUTCOMES['pagamento-annullato'];
const RECAPTCHA_FAILED_CODE = OUTCOMES['verifica-non-riuscita'];

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
    },
    [CHECKOUT_KO_CODE]: {
      title: 'Payment failed',
      body: 'You can retry or download the notice.',
      cta: 'Retry',
      downloadCta: 'Download notice'
    },
    [CANCELLED_CODE]: {
      title: 'Payment cancelled',
      body: 'You cancelled the payment. You can download the notice.',
      cta: 'Back to home',
      downloadCta: 'Download notice'
    },
    [RECAPTCHA_FAILED_CODE]: {
      title: 'Verification failed',
      body: 'The reCAPTCHA verification was not successful.',
      cta: 'Try again'
    }
  }
});

const mockSearchParams = new URLSearchParams();
const renderCourtesyPage = (param?: { outcome?: string }) => {
  vi.mocked(useParams).mockReturnValue(param ?? {});
  vi.mocked(useSearchParams).mockReturnValue([mockSearchParams, vi.fn()]);
  return render(<CourtesyPage />);
};

describe('ErrorIconComponent', () => {
  afterEach(() => vi.clearAllMocks());

  it('renders the "OK" pictogram for PAGAMENTO_AVVISO_COMPLETATO', () => {
    render(<ErrorIconComponent code={OUTCOMES['pagamento-avviso-completato']} />);
    const img = screen.getByTitle('OK');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/cittadini/pictograms/paymentcompleted.svg');
  });

  it('renders the "Error" pictogram for accesso-non-autorizzato', () => {
    render(<ErrorIconComponent code={OUTCOMES['accesso-non-autorizzato']} />);
    const img = screen.getByTitle('Error');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/cittadini/pictograms/genericerror.svg');
  });

  it('renders the "Error" pictogram for avviso-non-pagabile', () => {
    render(<ErrorIconComponent code={OUTCOMES['avviso-non-pagabile']} />);
    const img = screen.getByTitle('Error');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/cittadini/pictograms/genericerror.svg');
  });

  it('renders the "Error" pictogram for pagamento-non-riuscito', () => {
    render(<ErrorIconComponent code={OUTCOMES['pagamento-non-riuscito']} />);
    const img = screen.getByTitle('Error');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/cittadini/pictograms/warning.svg');
  });

  it('renders the "Error" pictogram for pagamento-annullato', () => {
    render(<ErrorIconComponent code={OUTCOMES['pagamento-annullato']} />);
    const img = screen.getByTitle('Error');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/cittadini/pictograms/warning.svg');
  });

  it('renders the "Expired" pictogram for sessione-scaduta', () => {
    render(<ErrorIconComponent code={OUTCOMES['sessione-scaduta']} />);
    const img = screen.getByTitle('Expired');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/cittadini/pictograms/expired.svg');
  });

  it('renders the "Verification failed" pictogram for verifica-non-riuscita', () => {
    render(<ErrorIconComponent code={OUTCOMES['verifica-non-riuscita']} />);
    const img = screen.getByTitle('Verification failed');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/cittadini/pictograms/genericerror.svg');
  });

  it('renders the umbrella pictogram for risorsa-non-trovata (falls to default)', () => {
    render(<ErrorIconComponent code={OUTCOMES['risorsa-non-trovata']} />);
    const img = screen.getByTitle('Something went wrong');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/cittadini/pictograms/umbrella.svg');
  });

  it('renders the umbrella pictogram for avvio-pagamento', () => {
    render(<ErrorIconComponent code={OUTCOMES['avvio-pagamento']} />);
    const img = screen.getByTitle('Something went wrong');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/cittadini/pictograms/umbrella.svg');
  });

  it('renders the umbrella pictogram for sconosciuto', () => {
    render(<ErrorIconComponent code={OUTCOMES['sconosciuto']} />);
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
    renderCourtesyPage({ outcome: 'codice-inesistente' });
    expect(screen.getByTestId('courtesyPage.title')).toHaveTextContent('Default title');
    expect(screen.getByTestId('courtesyPage.body')).toHaveTextContent('Default body');
  });

  it('resolves an error param and renders the correct icon', () => {
    renderCourtesyPage({ outcome: 'sessione-scaduta' });
    expect(screen.getByTitle('Expired')).toBeInTheDocument();
  });

  it('shows translated text for a known error param', () => {
    renderCourtesyPage({ outcome: 'sessione-scaduta' });
    expect(screen.getByTestId('courtesyPage.title')).toHaveTextContent('Session expired');
    expect(screen.getByTestId('courtesyPage.body')).toHaveTextContent('Your session has expired.');
  });

  it('resolves an outcome param and renders the correct icon', () => {
    renderCourtesyPage({ outcome: 'pagamento-avviso-completato' });
    expect(screen.getByTitle('OK')).toBeInTheDocument();
  });

  it('does NOT render the CTA when the translation key is absent', () => {
    renderCourtesyPage({ outcome: 'codice-inesistente' });
    expect(screen.queryByTestId('courtesyPage.cta')).not.toBeInTheDocument();
  });

  it('renders the CTA with correct text when the translation key exists', () => {
    renderCourtesyPage({ outcome: 'sessione-scaduta' });
    const cta = screen.getByTestId('courtesyPage.cta');
    expect(cta).toBeInTheDocument();
    expect(cta).toHaveTextContent('Log in again');
  });
});

describe('CourtesyPage – pagamento-non-riuscito (424)', () => {
  afterEach(() => vi.clearAllMocks());

  it('renders the Error icon for pagamento-non-riuscito', () => {
    renderCourtesyPage({ outcome: 'pagamento-non-riuscito' });
    expect(screen.getByTitle('Error')).toBeInTheDocument();
  });

  it('shows translated title and body for pagamento-non-riuscito', () => {
    renderCourtesyPage({ outcome: 'pagamento-non-riuscito' });
    expect(screen.getByTestId('courtesyPage.title')).toHaveTextContent('Payment failed');
    expect(screen.getByTestId('courtesyPage.body')).toHaveTextContent(
      'You can retry or download the notice.'
    );
  });

  it('renders CourtesyPageActions with code 424 instead of the default CTA', () => {
    renderCourtesyPage({ outcome: 'pagamento-non-riuscito' });
    const actions = screen.getByTestId('courtesyPageActions');
    expect(actions).toBeInTheDocument();
    expect(actions).toHaveAttribute('data-code', String(OUTCOMES['pagamento-non-riuscito']));
    expect(screen.queryByTestId('courtesyPage.cta')).not.toBeInTheDocument();
  });

  it('does NOT render CourtesyPageActions for other outcomes', () => {
    renderCourtesyPage({ outcome: 'sessione-scaduta' });
    expect(screen.queryByTestId('courtesyPageActions')).not.toBeInTheDocument();
    expect(screen.getByTestId('courtesyPage.cta')).toBeInTheDocument();
  });
});

describe('CourtesyPage – pagamento-annullato (425)', () => {
  afterEach(() => vi.clearAllMocks());

  it('renders the Error icon for pagamento-annullato', () => {
    renderCourtesyPage({ outcome: 'pagamento-annullato' });
    expect(screen.getByTitle('Error')).toBeInTheDocument();
  });

  it('shows translated title and body for pagamento-annullato', () => {
    renderCourtesyPage({ outcome: 'pagamento-annullato' });
    expect(screen.getByTestId('courtesyPage.title')).toHaveTextContent('Payment cancelled');
    expect(screen.getByTestId('courtesyPage.body')).toHaveTextContent(
      'You cancelled the payment. You can download the notice.'
    );
  });

  it('renders CourtesyPageActions with code 425 instead of the default CTA', () => {
    renderCourtesyPage({ outcome: 'pagamento-annullato' });
    const actions = screen.getByTestId('courtesyPageActions');
    expect(actions).toBeInTheDocument();
    expect(actions).toHaveAttribute('data-code', String(OUTCOMES['pagamento-annullato']));
    expect(screen.queryByTestId('courtesyPage.cta')).not.toBeInTheDocument();
  });
});

describe('CourtesyPage – verifica-non-riuscita (recaptcha)', () => {
  afterEach(() => vi.clearAllMocks());

  it('renders the "Verification failed" icon for verifica-non-riuscita', () => {
    renderCourtesyPage({ outcome: 'verifica-non-riuscita' });
    expect(screen.getByTitle('Verification failed')).toBeInTheDocument();
  });

  it('shows translated title and body for verifica-non-riuscita', () => {
    renderCourtesyPage({ outcome: 'verifica-non-riuscita' });
    expect(screen.getByTestId('courtesyPage.title')).toHaveTextContent('Verification failed');
    expect(screen.getByTestId('courtesyPage.body')).toHaveTextContent(
      'The reCAPTCHA verification was not successful.'
    );
  });

  it('renders a CTA button (not CourtesyPageActions) for verifica-non-riuscita', () => {
    renderCourtesyPage({ outcome: 'verifica-non-riuscita' });
    const cta = screen.getByTestId('courtesyPage.cta');
    expect(cta).toBeInTheDocument();
    expect(cta).toHaveTextContent('Try again');
    expect(screen.queryByTestId('courtesyPageActions')).not.toBeInTheDocument();
  });
});
