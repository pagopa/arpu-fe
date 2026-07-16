import { useMutation } from '@tanstack/react-query';
import utils from 'utils';
import { CartItem } from 'models/Cart';
import { AxiosError } from 'axios';
import { OUTCOMES } from 'routes/routes';
import { setCheckoutNotices } from 'store/CartStore';

const getRedirect = (data: string) => {
  const re = /URL=([^"]+)/;
  const match = data.match(re);
  if (!match) {
    throw new Error(`missing URL in ${data}`);
  }
  const url = match ? match[1] : 'No URL found';
  return url;
};

export const usePostCarts = ({
  onSuccess,
  onError,
  onUnprocessable
}: {
  onSuccess: (url: string) => void;
  onError?: (error: string) => void;
  // Called instead of `onError` when checkout answers 422 (unprocessable). Gets
  // the notices sent so the caller can probe which are already paid. When not
  // provided, 422 falls back to `onError(OUTCOMES['422'])` (legacy behavior).
  onUnprocessable?: (notices: CartItem[]) => void;
}) => {
  const carts = useMutation({
    mutationFn: async ({ notices, email }: { notices: CartItem[]; email?: string }) => {
      const request = utils.converters.cartItemsToCartsRequest(notices);
      const { data } = await utils.cartsClient.postCarts({ ...request, emailNotice: email });
      // Persist the notices sent to checkout so the AUTHENTICATED courtesy page
      // can display the KO/CANCEL outcome and retry even when the visible cart
      // is empty (direct "Paga subito" / installment flows bypass the cart).
      // Anonymous flows rebuild from query params, so they don't need this.
      if (!utils.storage.user.isAnonymous()) {
        setCheckoutNotices(notices, email);
      }
      return data;
    },
    onSuccess: (data: string) => onSuccess(getRedirect(data)),
    onError: (error: AxiosError, { notices }) => {
      if (error.code == 'ERR_BAD_REQUEST' && error.response?.status === 422) {
        if (onUnprocessable) return onUnprocessable(notices);
        return onError?.(OUTCOMES['422']);
      }
      onError?.(OUTCOMES['423']);
    }
  });

  return carts;
};
