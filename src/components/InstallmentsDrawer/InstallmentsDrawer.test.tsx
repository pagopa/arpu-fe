import { render, screen, fireEvent } from '__tests__/renderers';
import React from 'react';
import InstallmentsDrawer from './';
import { InstallmentDrawerItem } from 'models/InstallmentDrawer';
import { InstallmentStatus } from '../../../generated/data-contracts';
import { setInstallmentsDrawerState } from 'store/installmentsDrawer';
import * as cartActions from 'store/CartStore';
import * as installmentsDrawerActions from 'store/installmentsDrawer';
import { setBrokerInfo } from 'store/appStore';
import utils from 'utils';

const mockPostCartsMutate = vi.fn();
const mockNavigate = vi.fn();

vi.mock('hooks/usePostCarts', () => ({
  usePostCarts: (opts: { onSuccess: (url: string) => void; onError: (err: string) => void }) => ({
    mutate: (...args: unknown[]) => mockPostCartsMutate(opts, ...args),
    isPending: false
  })
}));

vi.mock('hooks/useUserEmail', () => ({
  useUserEmail: () => 'test@example.com'
}));

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

const makeItem = (overrides: Partial<InstallmentDrawerItem> = {}): InstallmentDrawerItem => ({
  installmentId: 1,
  rateIndex: 1,
  dueDate: '2024-08-31',
  amountCents: 150,
  paFullName: 'ENTE TEST',
  paTaxCode: 'TAX-1',
  debtPositionId: 123,
  paymentOptionId: 456,
  iuv: 'IUV-1',
  nav: 'NAV-1',
  remittanceInformation: 'Description 1',
  status: InstallmentStatus.UNPAID,
  allCCP: false,
  ...overrides
});

const baseItems: InstallmentDrawerItem[] = [
  makeItem({
    installmentId: 1,
    iuv: 'IUV-EXP',
    nav: 'NAV-EXP',
    status: InstallmentStatus.EXPIRED
  }),
  makeItem({
    installmentId: 2,
    iuv: 'IUV-PAID',
    nav: 'NAV-PAID',
    status: InstallmentStatus.PAID
  }),
  makeItem({
    installmentId: 3,
    iuv: 'IUV-UNPAID-1',
    nav: 'NAV-UNPAID-1',
    status: InstallmentStatus.UNPAID
  }),
  makeItem({
    installmentId: 4,
    iuv: 'IUV-UNPAID-2',
    nav: 'NAV-UNPAID-2',
    status: InstallmentStatus.UNPAID
  })
];

beforeEach(() => {
  setBrokerInfo(
    {
      brokerId: 1,
      externalId: 'test',
      brokerName: 'Test',
      brokerFiscalCode: 'TEST',
      config: { translation: {}, useCart: true }
    },
    'test'
  );
  setInstallmentsDrawerState(baseItems);
});

afterEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

describe('InstallmentsDrawer - rendering', () => {
  it('renders header, pay button and add-to-cart button when useCart=true', () => {
    render(<InstallmentsDrawer />);

    expect(screen.getByText(/app.installmentsDrawer.title/)).toBeVisible();
    expect(screen.getByText(/app.installmentsDrawer.actions.pay/)).toBeVisible();
    expect(screen.getByText(/app.installmentsDrawer.actions.add/)).toBeVisible();
  });

  it('does NOT render add-to-cart button when useCart=false', () => {
    setBrokerInfo(
      {
        brokerId: 1,
        externalId: 'test',
        brokerName: 'Test',
        brokerFiscalCode: 'TEST',
        config: { translation: {}, useCart: false }
      },
      'test'
    );
    render(<InstallmentsDrawer />);

    expect(screen.queryByText(/app.installmentsDrawer.actions.add/)).not.toBeInTheDocument();
  });

  it('renders the selected-installments section header', () => {
    render(<InstallmentsDrawer />);
    expect(screen.getByText(/app.installmentsDrawer.selectedInstallments/)).toBeVisible();
  });

  it('renders the available-installments section when more than one UNPAID item is present', () => {
    render(<InstallmentsDrawer />);
    expect(screen.getByText(/app.installmentsDrawer.availableInstallments/)).toBeVisible();
  });

  it('does NOT render the available section when only one UNPAID item exists', () => {
    setInstallmentsDrawerState([
      makeItem({
        iuv: 'IUV-ONLY',
        nav: 'NAV-ONLY',
        status: InstallmentStatus.UNPAID
      })
    ]);
    render(<InstallmentsDrawer />);

    expect(
      screen.queryByText(/app.installmentsDrawer.availableInstallments/)
    ).not.toBeInTheDocument();
  });
});

describe('InstallmentsDrawer - close', () => {
  it('closes the drawer when the close button is clicked', () => {
    const spy = vi.spyOn(installmentsDrawerActions, 'closeInstallmentsDrawer');
    render(<InstallmentsDrawer />);

    fireEvent.click(screen.getByLabelText(/app.installmentsDrawer.close/));
    expect(spy).toHaveBeenCalled();
  });

  it('closes the drawer when the overlay is clicked', () => {
    const spy = vi.spyOn(installmentsDrawerActions, 'closeInstallmentsDrawer');
    const { container } = render(<InstallmentsDrawer />);

    const overlay = container.querySelector('[aria-hidden="true"]');
    expect(overlay).toBeTruthy();
    fireEvent.click(overlay as Element);
    expect(spy).toHaveBeenCalled();
  });
});

describe('InstallmentsDrawer - addToCart', () => {
  it('adds the preselected installment to the cart and closes the drawer', () => {
    const addItemSpy = vi.spyOn(cartActions, 'addItem');
    const toggleCartSpy = vi.spyOn(cartActions, 'toggleCartDrawer');
    const setEmailSpy = vi.spyOn(cartActions, 'setCartEmail');
    const closeSpy = vi.spyOn(installmentsDrawerActions, 'closeInstallmentsDrawer');

    render(<InstallmentsDrawer />);

    fireEvent.click(screen.getByText(/app.installmentsDrawer.actions.add/));

    expect(setEmailSpy).toHaveBeenCalledWith('test@example.com');
    expect(addItemSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        iuv: 'IUV-UNPAID-1',
        nav: 'NAV-UNPAID-1',
        amount: 150,
        paFullName: 'ENTE TEST'
      })
    );
    expect(toggleCartSpy).toHaveBeenCalled();
    expect(closeSpy).toHaveBeenCalled();
  });

  it('logs an error and does not open the cart when an item has missing required data', () => {
    setInstallmentsDrawerState([
      makeItem({
        iuv: undefined,
        nav: 'NAV-BROKEN',
        status: InstallmentStatus.UNPAID
      })
    ]);
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const toggleCartSpy = vi.spyOn(cartActions, 'toggleCartDrawer');

    render(<InstallmentsDrawer />);
    fireEvent.click(screen.getByText(/app.installmentsDrawer.actions.add/));

    expect(errorSpy).toHaveBeenCalled();
    expect(toggleCartSpy).not.toHaveBeenCalled();
  });
});

describe('InstallmentsDrawer - payItems', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      writable: true,
      value: {
        ...originalLocation,
        replace: vi.fn(),
        assign: vi.fn()
      }
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      writable: true,
      value: originalLocation
    });
  });

  it('calls carts.mutate with the preselected item and closes the drawer', () => {
    const closeSpy = vi.spyOn(installmentsDrawerActions, 'closeInstallmentsDrawer');

    render(<InstallmentsDrawer />);
    fireEvent.click(screen.getByText(/app.installmentsDrawer.actions.pay/));

    expect(mockPostCartsMutate).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        email: 'test@example.com',
        notices: [
          expect.objectContaining({
            iuv: 'IUV-UNPAID-1',
            nav: 'NAV-UNPAID-1',
            amount: 150
          })
        ]
      })
    );
    expect(closeSpy).toHaveBeenCalled();
  });

  it('emits a notify when items to pay are corrupted (integrity fails)', () => {
    setInstallmentsDrawerState([
      makeItem({
        iuv: undefined,
        nav: 'NAV-BROKEN',
        status: InstallmentStatus.UNPAID
      })
    ]);
    const notifySpy = vi.spyOn(utils.notify, 'emit');

    render(<InstallmentsDrawer />);
    fireEvent.click(screen.getByText(/app.installmentsDrawer.actions.pay/));

    expect(notifySpy).toHaveBeenCalledWith(expect.stringContaining('Missing required data'));
    expect(mockPostCartsMutate).not.toHaveBeenCalled();
  });

  it('navigates to the courtesy page when the carts mutation fails', () => {
    render(<InstallmentsDrawer />);
    fireEvent.click(screen.getByText(/app.installmentsDrawer.actions.pay/));

    const [opts] = mockPostCartsMutate.mock.calls[0];
    opts.onError('generic');

    expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining('esito'));
  });

  it('replaces window.location on successful cart mutation', () => {
    render(<InstallmentsDrawer />);
    fireEvent.click(screen.getByText(/app.installmentsDrawer.actions.pay/));

    const [opts] = mockPostCartsMutate.mock.calls[0];
    opts.onSuccess('https://checkout.example');

    expect(window.location.replace).toHaveBeenCalledWith('https://checkout.example');
  });
});
