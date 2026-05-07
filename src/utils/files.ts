import { generatePath } from 'react-router-dom';
import { OUTCOMES, ROUTES } from 'routes/routes';
import { InstallmentDebtorExtendedDTO } from '../../generated/data-contracts';
import { UseMutateAsyncFunction } from '@tanstack/react-query';
import { ReceiptDetailArgs } from './loaders';
import utils from 'utils';
import i18n from 'translations/i18n';

/**
 * Downloads a file
 */
const downloadFile = (file: File, filename: string) => {
  const url = URL.createObjectURL(file);

  // Create a temporary <a> tag for downloading
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;

  // Trigger the download
  document.body.appendChild(a);
  a.click();

  // remove comment to open the file in a new tab
  // window.open(url, '_blank');

  // Remove the temporary <a> tag and release the URL of the Blob object
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const downloadBlob = (blob: Blob, fileName: string): void => {
  if (!blob || blob.size === 0) {
    throw new Error('Empty file');
  }
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Downloads a receipt
 */
export const downloadReceipt = async (
  mutateAsync: UseMutateAsyncFunction<
    {
      blob: File;
      filename: string | null;
    },
    Error,
    Pick<ReceiptDetailArgs, 'organizationId' | 'receiptId' | 'fiscalCode'>,
    unknown
  >,
  args: Pick<InstallmentDebtorExtendedDTO, 'organizationId' | 'receiptId'> & { fiscalCode?: string }
) => {
  try {
    if (args?.receiptId && args?.organizationId && args?.fiscalCode) {
      const { blob, filename } = await mutateAsync({
        organizationId: args.organizationId,
        receiptId: args.receiptId,
        fiscalCode: args.fiscalCode
      });
      downloadBlob(blob, filename || `${args?.receiptId}.pdf`);
    } else {
      throw new Error('Missing required parameters');
    }
  } catch {
    utils.notify.emit(i18n.t('app.receiptDetail.downloadError'));
  }
};

const generateDownloadUrl = ({
  orgId,
  nav,
  isAnonymous,
  fiscalCode
}: {
  orgId?: number;
  nav?: string;
  fiscalCode?: string;
  isAnonymous: boolean;
}) => {
  try {
    if (!nav || !orgId || !fiscalCode) throw new Error(OUTCOMES[400]);

    const route = isAnonymous
      ? ROUTES.public.PAYMENTS_ON_THE_FLY_DOWNLOAD
      : ROUTES.PAYMENTS_ON_THE_FLY_DOWNLOAD;

    return (
      generatePath(route, {
        orgId,
        nav
      }) + `#debtorFiscalCode=${fiscalCode}`
    );
  } catch (error) {
    const route = isAnonymous ? ROUTES.public.COURTESY_PAGE : ROUTES.COURTESY_PAGE;
    return generatePath(route, { outcome: error });
  }
};

export default {
  downloadFile,
  downloadBlob,
  generateDownloadUrl,
  downloadReceipt
};
