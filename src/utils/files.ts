import utils from 'utils';

/**
 * Downloads a file
 */
const downloadFile = (file: File, filename: string) => {
  console.log(file.name);
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

/**
 * Downloads pdf for a transaction
 */
const downloadReceiptPDF = async (transactionId: string) => {
  const response = await utils.loaders.getReceiptPDF(transactionId);
  if (!response) {
    throw new Error('Error getting the PDF');
  }

  const { data, filename } = response;
  downloadFile(data, filename);
};

export const downloadBlob = (blob: Blob, fileName: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export default {
  downloadReceiptPDF,
  downloadFile,
  downloadBlob
};
