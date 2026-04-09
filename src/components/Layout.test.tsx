import '@testing-library/jest-dom';
import { fireEvent, screen } from '@testing-library/react';
import React from 'react';
import { Layout } from './Layout';
import appStore from 'store/appStore';
import { render } from '__tests__/renderers';
import { ROUTES } from 'routes/routes';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useMatches: () => []
  };
});

// Mock child components to isolate Layout behavior
vi.mock('./Footer', () => ({
  Footer: () => <div data-testid="footer" />
}));

vi.mock('./Sidebar/Sidebar', () => ({
  Sidebar: () => <div data-testid="sidebar" />
}));

vi.mock('./Breadcrumbs/Breadcrumbs', () => ({
  default: () => <div data-testid="breadcrumbs" />
}));

vi.mock('./Header', () => ({
  Header: () => <div data-testid="header-authenticated" />
}));

vi.mock('./Header/SubHeader', () => ({
  SubHeader: () => <div data-testid="subheader" />
}));

vi.mock('components/ProductLogo', () => ({
  ProductLogo: () => <div data-testid="product-logo" />
}));

vi.mock('./Modals', () => ({
  ModalSystem: () => <div data-testid="modal-system" />
}));

vi.mock('./BackButton', () => ({
  BackButton: () => <div data-testid="back-button" />
}));

vi.mock('./Cart/CartDrawer', () => ({
  CartDrawer: () => <div data-testid="cart-drawer" />
}));

vi.mock('./Spontanei/PaymentTypeDrawer', () => ({
  default: () => <div data-testid="payment-type-drawer" />
}));

vi.mock('./InstallmentsDrawer', () => ({
  default: () => <div data-testid="installments-drawer" />
}));

vi.mock('./PageTitleProvider', () => ({
  PageTitleProvider: () => null
}));

vi.mock('./RouteGuard', () => ({
  RouteGuard: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

vi.mock('utils', () => ({
  default: {
    sidemenu: { status: { overlay: { value: false } } },
    modal: { status: { isOpen: { value: false } } },
    notify: {
      dismiss: vi.fn(),
      status: {
        isVisible: { value: false },
        payload: { value: null }
      }
    }
  }
}));

describe('Layout', () => {
  const defaultStoreValue = { ...appStore.value };

  afterEach(() => {
    vi.clearAllMocks();
    appStore.value = defaultStoreValue;
  });

  describe('authenticated mode', () => {
    it('should render the authenticated Header component', () => {
      render(<Layout />);
      expect(screen.getByTestId('header-authenticated')).toBeInTheDocument();
    });
  });

  describe('anonymous mode', () => {
    it('should render HeaderAccount with assistance button', () => {
      render(<Layout anonymous />);
      expect(screen.getByText('Assistenza')).toBeInTheDocument();
    });

    it('should open assistance link when clicking assistance button and link is configured', () => {
      const mockOpen = vi.spyOn(window, 'open').mockImplementation(() => null);

      appStore.value = {
        ...appStore.value,
        brokerInfo: {
          brokerId: 1,
          externalId: 'test',
          brokerName: 'Test Broker',
          brokerFiscalCode: '00000000000',
          config: {
            translation: {},
            assistanceLink: 'https://assistenza.pagopa.gov.it/hc/it/faq'
          }
        }
      };

      render(<Layout anonymous />);
      fireEvent.click(screen.getByText('Assistenza'));
      expect(mockOpen).toHaveBeenCalledWith('https://assistenza.pagopa.gov.it/hc/it/faq', '_blank');
      mockOpen.mockRestore();
    });

    it('should not call window.open when assistance link is not configured', () => {
      const mockOpen = vi.spyOn(window, 'open').mockImplementation(() => null);

      render(<Layout anonymous />);
      fireEvent.click(screen.getByText('Assistenza'));
      expect(mockOpen).not.toHaveBeenCalled();
      mockOpen.mockRestore();
    });

    it('should render assistance button even when link is not configured', () => {
      render(<Layout anonymous />);
      expect(screen.getByText('Assistenza')).toBeInTheDocument();
    });

    describe('rootLink brokerLink', () => {
      it('should use brokerLink as rootLink href when present in config', () => {
        appStore.value = {
          ...appStore.value,
          brokerInfo: {
            brokerId: 1,
            externalId: 'test',
            brokerName: 'Test Broker',
            brokerFiscalCode: '00000000000',
            config: {
              translation: {},
              brokerLink: 'https://broker.example.com'
            }
          }
        };

        render(<Layout anonymous />);

        const link = screen.getByRole('link', { name: 'Test Broker' });
        expect(link).toHaveAttribute('href', 'https://broker.example.com');
      });

      it('should fallback to DASHBOARD route when brokerLink is not present', () => {
        appStore.value = {
          ...appStore.value,
          brokerInfo: {
            brokerId: 1,
            externalId: 'test',
            brokerName: 'Test Broker',
            brokerFiscalCode: '00000000000',
            config: {
              translation: {}
            }
          }
        };

        render(<Layout anonymous />);

        const link = screen.getByRole('link', { name: 'Test Broker' });
        expect(link).toHaveAttribute('href', ROUTES.DASHBOARD);
      });
    });
  });
});
