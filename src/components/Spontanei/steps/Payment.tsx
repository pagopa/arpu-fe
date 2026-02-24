import { Button, Card, Stack, Typography } from '@mui/material';
import React, { useContext } from 'react';
import Controls from '../Controls';
import { useTranslation } from 'react-i18next';
import { addItem, isItemInCart, setCartEmail, toggleCartDrawer } from 'store/CartStore';
import notify from 'utils/notify';
import { useStore } from 'store/GlobalStore';
import utils from 'utils';
import { generatePath, useNavigate } from 'react-router-dom';
import { DebtPositionRequestDTO, FormTypeEnum } from '../../../../generated/data-contracts';
import { useField } from 'formik';
import { PaymentNoticeInfo } from '..';
import FormContext, { FormContextType } from '../FormContext';
import { usePostCarts } from 'hooks/usePostCarts';
import { ROUTES } from 'routes/routes';
import { CartItem } from 'models/Cart';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

/**
 * This component is responsible for rendering the payment step of the form.
 * @returns JSX.Element
 */
const Payment = () => {
  const context = useContext<FormContextType | null>(FormContext);

  const [fullName] = useField<PaymentNoticeInfo['fullName']>('fullName');
  const [amount] = useField<PaymentNoticeInfo['amount']>('amount');
  const [description] = useField<PaymentNoticeInfo['description']>('description');
  const [fiscalCode] = useField<PaymentNoticeInfo['fiscalCode']>('fiscalCode');
  const [entityType] = useField<PaymentNoticeInfo['entityType']>('entityType');
  const [org] = useField<PaymentNoticeInfo['org']>('org');
  const [debtType] = useField<PaymentNoticeInfo['debtType']>('debtType');
  const [email] = useField<PaymentNoticeInfo['email']>('email');
  const isAnonymous = utils.storage.user.isAnonymous();

  const organizationId = org.value?.organizationId;
  const debtPositionTypeOrgId = debtType.value?.debtPositionTypeOrgId;
  const userDescription = context?.userDescription || undefined;

  const navigate = useNavigate();
  const brokerId = utils.storage.app.getBrokerId();
  const formType = context?.formType;

  if (!organizationId || !debtPositionTypeOrgId || !brokerId) {
    throw new Error('Missing required parameters');
  }

  const { t } = useTranslation();

  const {
    state: { cart }
  } = useStore();

  const body: DebtPositionRequestDTO = {
    organizationId: organizationId,
    debtPositionTypeOrgId: debtPositionTypeOrgId,
    paymentOptions: [
      {
        totalAmountCents: amount.value,
        installments: [
          {
            amountCents: amount.value,
            remittanceInformation: description.value,
            userRemittanceInformation:
              formType !== FormTypeEnum.CUSTOM ? description.value : userDescription,
            debtor: {
              entityType: entityType.value,
              fiscalCode: fiscalCode.value,
              fullName: fullName.value,
              email: email.value
            }
          }
        ]
      }
    ]
  };

  const { data: debtPositionResponse } = isAnonymous
    ? utils.loaders.public.createPublicSpontaneousDebtPosition(Number(brokerId), body)
    : utils.loaders.createSpontaneousDebtPosition(Number(brokerId), body);

  const addToCart = () => {
    if (!debtPositionResponse) return;
    const { orgFiscalCode, orgName, paymentDetails } = debtPositionResponse;
    const { iuv, amountCents: amount, nav, remittanceInformation: description } = paymentDetails;
    if (!iuv || !nav) return;
    if (isItemInCart(iuv)) return;
    if (cart.items.length >= 5) return notify.emit(t('app.cart.items.full'), 'error');
    setCartEmail(email.value || undefined);
    addItem({
      amount,
      paTaxCode: orgFiscalCode,
      paFullName: orgName,
      iuv,
      nav,
      description
    });
    toggleCartDrawer();
  };

  const carts = usePostCarts({
    onSuccess: (url) => {
      window.location.replace(url);
    },
    onError: (error: string) => navigate(ROUTES.COURTESY_PAGE.replace(':error', error))
  });

  const pay = () => {
    if (!debtPositionResponse?.paymentDetails) return;
    const { orgFiscalCode, orgName } = debtPositionResponse;
    const { amountCents, nav, iuv, remittanceInformation } = debtPositionResponse.paymentDetails;
    if (!nav || !iuv) return;
    const item: CartItem = {
      amount: amountCents,
      nav,
      iuv,
      paTaxCode: orgFiscalCode,
      paFullName: orgName,
      description: remittanceInformation
    };
    carts.mutate({ notices: [item], email: email.value || undefined });
  };

  const goToDownloadPaymentNoticePage = () => {
    if (!debtPositionResponse) return;
    const { organizationId: orgId, paymentDetails } = debtPositionResponse;
    const { iuv } = paymentDetails;
    if (!iuv) return;
    isAnonymous
      ? navigate(generatePath(ROUTES.public.PAYMENTS_ON_THE_FLY_DOWNLOAD, { orgId, iuv }), {
          state: { debtorFiscalCode: fiscalCode.value }
        })
      : navigate(generatePath(ROUTES.PAYMENTS_ON_THE_FLY_DOWNLOAD, { orgId, iuv }));
  };

  return (
    <>
      <Card variant="outlined" data-testid="spontanei-step4-payment-container">
        <Stack spacing={2} padding={4}>
          <Typography variant="h6">{t('spontanei.form.steps.step5.title')}</Typography>
          <Typography>{t('spontanei.form.steps.step5.description')}</Typography>

          <Card variant="outlined" data-testid="payment-methods-card">
            <Stack spacing={2} padding={4} direction="row" justifyContent="space-between">
              <Stack>
                <Typography fontSize="18px" fontWeight="600">
                  {t('spontanei.form.steps.step5.pay.title')}
                </Typography>
                <Typography fontSize="16px" fontWeight="400" color="action.active">
                  {t('spontanei.form.steps.step5.pay.description')}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="text"
                  onClick={addToCart}
                  startIcon={<ShoppingCartIcon />}
                  data-testid="add-to-cart-button">
                  {t('spontanei.form.steps.step5.pay.addItemToCartButton')}
                </Button>
                <Button variant="contained" onClick={pay} data-testid="pay-button">
                  {t('spontanei.form.steps.step5.pay.payButton')}
                </Button>
              </Stack>
            </Stack>
          </Card>

          <Card variant="outlined" data-testid="download-notice-card">
            <Stack spacing={2} padding={4} direction="row" justifyContent="space-between">
              <Stack>
                <Typography fontSize="18px" fontWeight="600">
                  {t('spontanei.form.steps.step5.download.title')}
                </Typography>
                <Typography fontSize="16px" fontWeight="400" color="action.active">
                  {t('spontanei.form.steps.step5.download.description')}
                </Typography>
              </Stack>
              <Button
                variant="text"
                startIcon={<FileDownloadIcon />}
                onClick={goToDownloadPaymentNoticePage}
                data-testid="download-notice-button">
                {t('spontanei.form.steps.step5.download.downloadButton')}
              </Button>
            </Stack>
          </Card>
        </Stack>
      </Card>
      <Controls hideContinue={true} />
    </>
  );
};

export default Payment;
