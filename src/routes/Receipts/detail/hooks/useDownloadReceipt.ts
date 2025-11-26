import { useMutation } from '@tanstack/react-query';
import utils from 'utils';

export type DownloadReceiptArgs = Parameters<typeof utils.arpuBeApiClient.brokers.getReceiptPdf>;

export const useDownloadReceipt = ([brokerId, organizationId, receiptId]: DownloadReceiptArgs) =>
  useMutation({
    mutationKey: ['downloadReceipt', brokerId, organizationId, receiptId],
    mutationFn: async () => {
      const response = await utils.arpuBeApiClient.brokers.getReceiptPdf(
        brokerId,
        organizationId,
        receiptId,
        { format: 'blob' }
      );

      const contentDisposition = response.headers['content-disposition'] || '';
      const filename = utils.converters.extractFilename(contentDisposition);
      return { blob: response.data, filename };
    }
  });
