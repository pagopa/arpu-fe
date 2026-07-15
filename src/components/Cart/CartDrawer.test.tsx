import React from 'react';
import { describe, it, expect, Mock } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CartDrawer } from './CartDrawer';
import { deleteItem, toggleCartDrawer } from 'store/CartStore';
import { generatePath, useLocation, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { OUTCOMES, ROUTES } from 'routes/routes';
import utils from 'utils';

vi.mock(import('store/CartStore'), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    toggleCartDrawer: vi.fn(actual.toggleCartDrawer),
    deleteItem: vi.fn()
  };
});

// Capture the options passed to usePostCarts so we can drive onError/onUnprocessable directly.
const mockUsePostCarts = vi.hoisted(() => vi.fn());
vi.mock('hooks/usePostCarts', () => ({ usePostCarts: mockUsePostCarts }));

const mockVerifyMutateAsync = vi.hoisted(() => vi.fn());
vi.mock('utils/loaders', () => ({
  default: { public: { useVerifyPaidNotices: () => ({ mutateAsync: mockVerifyMutateAsync }) } }
}));

const mockUseStore = vi.hoisted(() => vi.fn());
vi.mock('store/GlobalStore', () => {
  return {
    useStore: mockUseStore
  };
});

vi.mock('react-router-dom', async (importActual) => ({
  ...(await importActual<typeof import('react-router-dom')>()),
  useNavigate: vi.fn(),
  useLocation: vi.fn()
}));

describe('CartDrawer', () => {
  const mockNavigate = vi.fn();
  const queryClient = new QueryClient();
  // last options object CartDrawer passed to usePostCarts
  let postCartsOptions: Parameters<typeof import('hooks/usePostCarts').usePostCarts>[0];

  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as Mock).mockReturnValue(mockNavigate);
    // default: not on the locked cart route, so the drawer is dismissable
    (useLocation as Mock).mockReturnValue({ pathname: '/somewhere' });
    mockUsePostCarts.mockImplementation((opts) => {
      postCartsOptions = opts;
      return { mutate: vi.fn() };
    });
    vi.spyOn(utils.storage.user, 'isAnonymous').mockReturnValue(false);
  });

  it('renders the cart drawer when empty', () => {
    mockUseStore.mockReturnValue({
      state: {
        cart: {
          items: []
        }
      }
    });

    render(
      <QueryClientProvider client={queryClient}>
        <CartDrawer />
      </QueryClientProvider>
    );

    expect(screen.getByLabelText('app.cart.header.title')).toBeInTheDocument();
    expect(screen.getByText('app.cart.header.amount')).toBeInTheDocument();
    expect(screen.getByText('app.cart.empty.title')).toBeInTheDocument();
    expect(screen.getByText('app.cart.empty.description')).toBeInTheDocument();
    expect(screen.getByText('app.cart.items.back')).toBeInTheDocument();
  });

  it('closes the cart drawer when the close button is clicked', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <CartDrawer />
      </QueryClientProvider>
    );
    const closeButton = screen.getByLabelText('app.cart.header.close');
    fireEvent.click(closeButton);

    expect(toggleCartDrawer).toHaveBeenCalled();
  });

  it('hides the close button on the locked cart route', () => {
    (useLocation as Mock).mockReturnValue({ pathname: ROUTES.CART });
    mockUseStore.mockReturnValue({
      state: {
        cart: {
          items: [],
          isOpen: true
        }
      }
    });

    render(
      <QueryClientProvider client={queryClient}>
        <CartDrawer />
      </QueryClientProvider>
    );

    // drawer still renders, but cannot be dismissed
    expect(screen.getByLabelText('app.cart.header.title')).toBeInTheDocument();
    expect(screen.queryByLabelText('app.cart.header.close')).not.toBeInTheDocument();
  });

  it('navigates to the payment notices page when the button is clicked', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <CartDrawer />
      </QueryClientProvider>
    );
    const emptyButton = screen.getByText('app.cart.items.back');
    fireEvent.click(emptyButton);

    expect(toggleCartDrawer).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith(ROUTES.DEBT_POSITIONS);
  });

  it('allow the click on pay button when the cart is not empty', () => {
    mockUseStore.mockReturnValue({
      state: {
        cart: {
          items: [
            {
              amount: 100,
              iuv: 'iuvTest',
              paFullName: 'paFullNameTest',
              description: 'descriptionTest'
            }
          ]
        }
      }
    });

    render(
      <QueryClientProvider client={queryClient}>
        <CartDrawer />
      </QueryClientProvider>
    );
    const payButton = screen.getByText('app.cart.items.pay');
    fireEvent.click(payButton);
  });

  it('does not show the back button when the user is anonymous', () => {
    mockUseStore.mockReturnValue({
      state: {
        cart: {
          items: []
        }
      }
    });

    vi.spyOn(utils.storage.user, 'isAnonymous').mockReturnValue(true);

    render(
      <QueryClientProvider client={queryClient}>
        <CartDrawer />
      </QueryClientProvider>
    );
    const backButton = screen.queryByTestId('cart-back-button');
    expect(backButton).not.toBeInTheDocument();
  });

  describe('checkout 422 handling', () => {
    const notices = [
      {
        amount: 100,
        iuv: 'iuvPaid',
        nav: 'navPaid',
        paFullName: 'pa',
        paTaxCode: 'tax',
        description: 'd',
        allCCP: false
      },
      {
        amount: 200,
        iuv: 'iuvOpen',
        nav: 'navOpen',
        paFullName: 'pa',
        paTaxCode: 'tax',
        description: 'd',
        allCCP: false
      }
    ];

    const renderDrawer = () => {
      mockUseStore.mockReturnValue({ state: { cart: { items: notices } } });
      render(
        <QueryClientProvider client={queryClient}>
          <CartDrawer />
        </QueryClientProvider>
      );
    };

    it('removes paid notices and redirects to the removed-from-cart page on 422', async () => {
      mockVerifyMutateAsync.mockResolvedValue([notices[0]]);
      renderDrawer();

      await postCartsOptions.onUnprocessable!(notices);

      expect(deleteItem).toHaveBeenCalledWith('iuvPaid');
      expect(deleteItem).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith(
        generatePath(ROUTES.COURTESY_PAGE, { outcome: OUTCOMES[428] })
      );
    });

    it('redirects to the generic error page when no notice is paid', async () => {
      mockVerifyMutateAsync.mockResolvedValue([]);
      renderDrawer();

      await postCartsOptions.onUnprocessable!(notices);

      expect(deleteItem).not.toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith(
        generatePath(ROUTES.COURTESY_PAGE, { outcome: OUTCOMES[400] })
      );
    });

    it('redirects to the generic error page when the verify call fails', async () => {
      mockVerifyMutateAsync.mockRejectedValue(new Error('boom'));
      renderDrawer();

      await postCartsOptions.onUnprocessable!(notices);

      expect(deleteItem).not.toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith(
        generatePath(ROUTES.COURTESY_PAGE, { outcome: OUTCOMES[400] })
      );
    });

    it('redirects an anonymous user to the public courtesy page', () => {
      vi.spyOn(utils.storage.user, 'isAnonymous').mockReturnValue(true);
      renderDrawer();

      postCartsOptions.onError!(OUTCOMES[400]);

      expect(mockNavigate).toHaveBeenCalledWith(
        generatePath(ROUTES.public.COURTESY_PAGE, { outcome: OUTCOMES[400] })
      );
    });
  });
});
