import { renderHook, act, waitFor } from '@testing-library/react';
import { usePostCarts } from './usePostCarts';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import utils from 'utils';
import React, { ReactNode } from 'react';

import { AxiosResponse } from 'axios';
import { ArcRoutes } from 'routes/routes';
import { CartItem } from 'models/Cart';

const mockCartItems: CartItem[] = [
  {
    paTaxCode: '99999000013',
    paFullName: 'EC Demo Pagamenti Pull Test',
    iuv: '7442658002593149',
    nav: '37442658002593149',
    amount: 588,
    description: 'Test Pull - unica opzione'
  }
];

export const createWrapper = () => {
  const queryClient = new QueryClient();
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('usePostCarts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  const mockOnSuccess = vi.fn();
  const mockOnError = vi.fn();

  it('should converters cartItem[] correctly and call onSuccess as callback', async () => {
    const mockData = 'Response with URL=https://redirect.com';

    vi.spyOn(utils.cartsClient, 'postCarts').mockResolvedValue({ data: mockData } as AxiosResponse);
    vi.spyOn(utils.storage.user, 'isAnonymous').mockReturnValue(false);

    const { result } = renderHook(
      () => usePostCarts({ onSuccess: mockOnSuccess, onError: mockOnError }),
      {
        wrapper: createWrapper()
      }
    );

    await act(async () => {
      await result.current.mutateAsync({ notices: mockCartItems, email: 'test@test.it' });
    });

    await waitFor(() => !result.current.isIdle);

    const ORIGIN = window.location.origin;

    expect(utils.cartsClient.postCarts).toHaveBeenCalledWith({
      emailNotice: 'test@test.it',
      paymentNotices: [
        {
          noticeNumber: mockCartItems[0].nav,
          fiscalCode: mockCartItems[0].paTaxCode,
          amount: mockCartItems[0].amount,
          companyName: mockCartItems[0].paFullName,
          description: mockCartItems[0].description
        }
      ],
      returnUrls: {
        returnOkUrl: `${ORIGIN}${ArcRoutes.DASHBOARD}?fromAction=payment-success`,
        returnCancelUrl: `${ORIGIN}${ArcRoutes.DEBT_POSITIONS}?fromAction=payment-cancel`,
        returnErrorUrl: `${ORIGIN}${ArcRoutes.DEBT_POSITIONS}?fromAction=payment-error`
      }
    });
    expect(mockOnSuccess).toHaveBeenCalledWith('https://redirect.com');
    expect(mockOnError).not.toHaveBeenCalled();
  });
});
