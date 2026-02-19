import React from 'react';
import { render, screen } from '@testing-library/react';
import { CourtesyPage } from '.';
import '@testing-library/jest-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorIconComponent } from './index';
import { ArcErrors, ArpuOutcome } from 'routes/routes';

const queryClient = new QueryClient();

vi.mock('react-router-dom', () => ({
  useSearchParams: () => [
    {
      get: () => '403'
    }
  ],
  useParams: vi.fn(),
  Link: vi.fn()
}));

describe('UserRoute', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <CourtesyPage />
      </QueryClientProvider>
    );
  });
});

describe('ErrorIconComponent', () => {
  it('should render the ErrorIconComponent correctly (accesso-non-autorizzato)', () => {
    render(<ErrorIconComponent code={ArcErrors['accesso-non-autorizzato']} />);
    const imgElement = screen.getByTitle('Error');
    expect(imgElement).toBeInTheDocument();
    expect(imgElement).toHaveAttribute('src', '/cittadini/pictograms/genericerror.svg');
  });

  it('should render the ErrorIconComponent correctly (avviso-non-pagabile)', () => {
    render(<ErrorIconComponent code={ArcErrors['accesso-non-autorizzato']} />);
    const imgElement = screen.getByTitle('Error');
    expect(imgElement).toBeInTheDocument();
    expect(imgElement).toHaveAttribute('src', '/cittadini/pictograms/genericerror.svg');
  });

  it('should render the ErrorIconComponent correctly (sessione-scaduta)', () => {
    render(<ErrorIconComponent code={ArcErrors['sessione-scaduta']} />);
    const imgElement = screen.getByTitle('Expired');
    expect(imgElement).toBeInTheDocument();
    expect(imgElement).toHaveAttribute('src', '/cittadini/pictograms/expired.svg');
  });

  it('should render the ErrorIconComponent correctly (risorsa-non-trovata)', () => {
    render(<ErrorIconComponent code={ArcErrors['risorsa-non-trovata']} />);
    const imgElement = screen.getByTitle('Something went wrong');
    expect(imgElement).toBeInTheDocument();
    expect(imgElement).toHaveAttribute('src', '/cittadini/pictograms/umbrella.svg');
  });

  it('should render the ErrorIconComponent correctly (avvio-pagamento)', () => {
    render(<ErrorIconComponent code={ArcErrors['avvio-pagamento']} />);
    const imgElement = screen.getByTitle('Something went wrong');
    expect(imgElement).toBeInTheDocument();
    expect(imgElement).toHaveAttribute('src', '/cittadini/pictograms/umbrella.svg');
  });

  it('should render the ErrorIconComponent correctly (sconosciuto)', () => {
    render(<ErrorIconComponent code={ArcErrors['sconosciuto']} />);
    const imgElement = screen.getByTitle('Something went wrong');
    expect(imgElement).toBeInTheDocument();
    expect(imgElement).toHaveAttribute('src', '/cittadini/pictograms/umbrella.svg');
  });

  it('should render the ErrorIconComponent correctly (pagamento-completato)', () => {
    render(<ErrorIconComponent code={ArpuOutcome.PAGAMENTO_AVVISO_COMPLETATO} />);
    const imgElement = screen.getByTitle('OK');
    expect(imgElement).toBeInTheDocument();
    expect(imgElement).toHaveAttribute('src', '/cittadini/pictograms/paymentcompleted.svg');
  });

  it('should render the ErrorIconComponent default correctly', () => {
    render(<ErrorIconComponent />);
    const imgElement = screen.getByTitle('Something went wrong');
    expect(imgElement).toBeInTheDocument();
    expect(imgElement).toHaveAttribute('src', '/cittadini/pictograms/umbrella.svg');
  });
});
