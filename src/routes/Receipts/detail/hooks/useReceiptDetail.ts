import { useQuery } from '@tanstack/react-query';
import utils from 'utils';

export type ReceiptDetailArgs = Parameters<typeof utils.arpuBeApiClient.brokers.getReceiptDetail>;

export const useReceiptDetail = (args: ReceiptDetailArgs) =>
  useQuery({
    queryKey: ['receiptDetail', ...args],
    queryFn: async () => {
      const { data } = await utils.arpuBeApiClient.brokers.getReceiptDetail(...args);
      return data;
    }
  });
