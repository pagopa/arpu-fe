/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { act } from '@testing-library/react';
import { OUTCOMES } from '../../../routes/routes';
import {
  useCheckoutRetry,
  useClearCartOnSuccess,
  useEmptyCartGuard,
  useOutcomeFlags
} from './useCourtesyPageActions';
import { renderHook } from '__tests__/renderers';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

const mockUseStore = vi.fn();
vi.mock('store/GlobalStore', async () => {
  const actual = await vi.importActual<typeof import('store/GlobalStore')>('store/GlobalStore');
  return {
    ...actual,
    useStore: () => mockUseStore()
  };
});

const mockResetCart = vi.fn();
vi.mock('store/CartStore', async (importOriginal) => {
  const actual = await importOriginal<typeof import('store/CartStore')>();
  return {
    ...actual,
    resetCart: () => mockResetCart()
  };
});

const mockNotifyEmit = vi.fn();
vi.mock('utils/notify', () => ({
  default: { emit: (msg: string) => mockNotifyEmit(msg) }
}));

const mockMutate = vi.fn();
let capturedPostCartsOptions: { onSuccess: (url: string) => void; onError: () => void } | null =
  null;

vi.mock('hooks/usePostCarts', () => ({
  usePostCarts: (options: { onSuccess: (url: string) => void; onError: () => void }) => {
    capturedPostCartsOptions = options;
    return { mutate: mockMutate, isPending: false };
  }
}));

const setCart = (items: unknown[], email?: string) => {
  mockUseStore.mockReturnValue({
    state: { cart: { items, email: email ?? null } }
  });
};

beforeEach(() => {
  setCart([]);
});

afterEach(() => {
  vi.clearAllMocks();
  capturedPostCartsOptions = null;
});

describe('useOutcomeFlags', () => {
  it('returns isOk=true only for pagamento-avviso-completato', () => {
    const { result } = renderHook(() => useOutcomeFlags(OUTCOMES['pagamento-avviso-completato']));
    expect(result.current).toEqual({
      isOk: true,
      isKo: false,
      isCancelled: false,
      isRetryableOutcome: false
    });
  });

  it('returns isKo=true and isRetryableOutcome=true for pagamento-non-riuscito', () => {
    const { result } = renderHook(() => useOutcomeFlags(OUTCOMES['pagamento-non-riuscito']));
    expect(result.current).toEqual({
      isOk: false,
      isKo: true,
      isCancelled: false,
      isRetryableOutcome: true
    });
  });

  it('returns isCancelled=true and isRetryableOutcome=true for pagamento-annullato', () => {
    const { result } = renderHook(() => useOutcomeFlags(OUTCOMES['pagamento-annullato']));
    expect(result.current).toEqual({
      isOk: false,
      isKo: false,
      isCancelled: true,
      isRetryableOutcome: true
    });
  });

  it('returns all false for an unknown outcome (e.g. sconosciuto)', () => {
    const { result } = renderHook(() => useOutcomeFlags(OUTCOMES['sconosciuto']));
    expect(result.current).toEqual({
      isOk: false,
      isKo: false,
      isCancelled: false,
      isRetryableOutcome: false
    });
  });

  it('memoizes: same code -> same object reference across re-renders', () => {
    const { result, rerender } = renderHook(({ code }) => useOutcomeFlags(code), {
      initialProps: { code: OUTCOMES['pagamento-non-riuscito'] }
    });
    const first = result.current;
    rerender({ code: OUTCOMES['pagamento-non-riuscito'] });
    expect(result.current).toBe(first);
  });

  it('recomputes when code changes', () => {
    const { result, rerender } = renderHook(({ code }) => useOutcomeFlags(code), {
      initialProps: { code: OUTCOMES['pagamento-non-riuscito'] }
    });
    expect(result.current.isKo).toBe(true);
    rerender({ code: OUTCOMES['pagamento-avviso-completato'] });
    expect(result.current.isOk).toBe(true);
    expect(result.current.isKo).toBe(false);
  });
});

describe('useClearCartOnSuccess', () => {
  it('clears the cart when isOk=true and cart has items', () => {
    setCart([{ iuv: 'abc' }]);
    renderHook(() => useClearCartOnSuccess(true));
    expect(mockResetCart).toHaveBeenCalledTimes(1);
  });

  it('does NOT clear when isOk=true but cart is already empty (write guard)', () => {
    setCart([]);
    renderHook(() => useClearCartOnSuccess(true));
    expect(mockResetCart).not.toHaveBeenCalled();
  });

  it('does NOT clear when isOk=false even if cart has items', () => {
    setCart([{ iuv: 'abc' }, { iuv: 'def' }]);
    renderHook(() => useClearCartOnSuccess(false));
    expect(mockResetCart).not.toHaveBeenCalled();
  });

  it('does not double-clear on re-render with the same inputs', () => {
    setCart([{ iuv: 'abc' }]);
    const { rerender } = renderHook(({ isOk }) => useClearCartOnSuccess(isOk), {
      initialProps: { isOk: true }
    });
    rerender({ isOk: true });
    expect(mockResetCart).toHaveBeenCalledTimes(1);
  });
});

describe('useEmptyCartGuard', () => {
  const ROUTE = '/public/courtesy/:outcome';
  const EXPECTED_REDIRECT = `/public/courtesy/${OUTCOMES['sconosciuto']}`;

  it('redirects to sconosciuto when retryable and cart is empty', () => {
    setCart([]);
    renderHook(() => useEmptyCartGuard(true, ROUTE));
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith(EXPECTED_REDIRECT);
  });

  it('does NOT redirect when retryable but cart has items', () => {
    setCart([{ iuv: 'abc' }]);
    renderHook(() => useEmptyCartGuard(true, ROUTE));
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('does NOT redirect when not retryable even if cart is empty', () => {
    setCart([]);
    renderHook(() => useEmptyCartGuard(false, ROUTE));
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('uses the route passed in (works for both public and authenticated)', () => {
    setCart([]);
    renderHook(() => useEmptyCartGuard(true, '/private/courtesy/:outcome'));
    expect(mockNavigate).toHaveBeenCalledWith(`/private/courtesy/${OUTCOMES['sconosciuto']}`);
  });
});

describe('useCheckoutRetry', () => {
  describe('retry()', () => {
    it('calls postCarts.mutate with notices only when email is omitted', () => {
      const { result } = renderHook(() => useCheckoutRetry());
      const notices = [{ iuv: 'abc' } as any];

      act(() => result.current.retry(notices));

      expect(mockMutate).toHaveBeenCalledWith({ notices, email: undefined });
    });

    it('forwards email when it is a truthy string', () => {
      const { result } = renderHook(() => useCheckoutRetry());
      const notices = [{ iuv: 'abc' } as any];

      act(() => result.current.retry(notices, 'user@example.com'));

      expect(mockMutate).toHaveBeenCalledWith({
        notices,
        email: 'user@example.com'
      });
    });

    it('coerces empty-string email to undefined', () => {
      const { result } = renderHook(() => useCheckoutRetry());

      act(() => result.current.retry([], ''));

      expect(mockMutate).toHaveBeenCalledWith({ notices: [], email: undefined });
    });
  });

  describe('onSuccess wiring', () => {
    let assignSpy: Mock;
    let originalLocation: Location;

    beforeEach(() => {
      originalLocation = window.location;
      assignSpy = vi.fn();
      Object.defineProperty(window, 'location', {
        configurable: true,
        writable: true,
        value: { ...originalLocation, assign: assignSpy }
      });
    });

    afterEach(() => {
      Object.defineProperty(window, 'location', {
        configurable: true,
        writable: true,
        value: originalLocation
      });
    });

    it('redirects to the checkout URL on success', () => {
      renderHook(() => useCheckoutRetry());
      expect(capturedPostCartsOptions).not.toBeNull();

      capturedPostCartsOptions!.onSuccess('https://checkout.example/pay/123');

      expect(assignSpy).toHaveBeenCalledWith('https://checkout.example/pay/123');
    });
  });

  describe('onError wiring', () => {
    it('emits a notification toast on error', () => {
      renderHook(() => useCheckoutRetry());
      expect(capturedPostCartsOptions).not.toBeNull();

      capturedPostCartsOptions!.onError();

      expect(mockNotifyEmit).toHaveBeenCalledTimes(1);
      expect(typeof mockNotifyEmit.mock.calls[0][0]).toBe('string');
    });
  });
});
