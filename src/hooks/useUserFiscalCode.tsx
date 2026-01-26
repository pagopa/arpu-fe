import utils from 'utils';

export const useUserFiscalCode = () => {
  const { data } = utils.loaders.getUserInfo();
  return data?.fiscalCode;
};
