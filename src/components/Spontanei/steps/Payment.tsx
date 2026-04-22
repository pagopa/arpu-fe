import { Button, Card, Stack, Typography } from '@mui/material';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { addItem, isItemInCart, setCartEmail, toggleCartDrawer } from 'store/CartStore';
import notify from 'utils/notify';
import { useStore } from 'store/GlobalStore';
import utils from 'utils';
import { Link, useNavigate } from 'react-router-dom';
import { DebtPositionRequestDTO } from '../../../../generated/data-contracts';
import { useField, useFormikContext } from 'formik';
import { PaymentNoticeInfo } from '..';
import FormContext, { FormContextType } from '../FormContext';
import { usePostCarts } from 'hooks/usePostCarts';
import { ROUTES } from 'routes/routes';
import { CartItem } from 'models/Cart';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import appStore from 'store/appStore';
import { flattenObject } from '../DinamicForm/config';
import { useRecaptcha } from 'components/RecaptchaProvider/RecaptchaProvider';
import styled from '@mui/system/styled';
import { ResponsiveCard } from 'components/ResponsiveCard';

const SpacedStack = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(3),
  paddingY: theme.spacing(4),
  paddingX: { xs: 0, md: theme.spacing(3) }
}));

const Payment = () => {
  const context = useContext<FormContextType | null>(FormContext);
  const { submitFields } = context || {};

  const { values } = useFormikContext<PaymentNoticeInfo>();
  const flattenedValues = flattenObject(values);

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

  const navigate = useNavigate();
  const brokerId = utils.storage.app.getBrokerId();

  if (!organizationId || !debtPositionTypeOrgId || !brokerId) {
    throw new Error('Missing required parameters');
  }

  const fieldValues: DebtPositionRequestDTO['fieldValues'] = useMemo(
    () =>
      submitFields?.reduce((acc, field) => {
        if (!field.key || !field.name || !flattenedValues[field.key]) return acc;
        return {
          ...acc,
          [field.name]: flattenedValues[field.key]
        };
      }, {}),
    [flattenedValues, submitFields]
  );

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
            userRemittanceInformation: description.value,
            debtor: {
              entityType: entityType.value,
              fiscalCode: fiscalCode.value,
              fullName: fullName.value,
              email: email.value
            }
          }
        ]
      }
    ],
    fieldValues
  };

  const { executeRecaptcha, isEnabled: isRecaptchaEnabled } = useRecaptcha();

  const [recaptchaToken, setRecaptchaToken] = useState<string | null | undefined>(
    isAnonymous && isRecaptchaEnabled ? null : undefined
  );

  useEffect(() => {
    const fetchToken = async () => {
      if (!isAnonymous || !isRecaptchaEnabled) return;
      try {
        const token = await executeRecaptcha();
        setRecaptchaToken(token ?? undefined);
      } catch {
        setRecaptchaToken(undefined);
      }
    };
    fetchToken();
  }, [isAnonymous, isRecaptchaEnabled, executeRecaptcha]);

  const { data: debtPositionResponse } = isAnonymous
    ? utils.loaders.public.createPublicSpontaneousDebtPosition(
        Number(brokerId),
        body,
        recaptchaToken
      )
    : utils.loaders.createSpontaneousDebtPosition(Number(brokerId), body);

  const addToCart = () => {
    if (!debtPositionResponse) return;
    const { orgFiscalCode, orgName, paymentDetails } = debtPositionResponse;
    const {
      iuv,
      amountCents: amount,
      nav,
      remittanceInformation: description,
      allCCP
    } = paymentDetails;
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
      description,
      allCCP: allCCP ?? false
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
    const { amountCents, nav, iuv, remittanceInformation, allCCP } =
      debtPositionResponse.paymentDetails;
    if (!nav || !iuv) return;
    const item: CartItem = {
      amount: amountCents,
      nav,
      iuv,
      paTaxCode: orgFiscalCode,
      paFullName: orgName,
      description: remittanceInformation,
      allCCP: allCCP ?? false
    };
    carts.mutate({
      notices: [item],
      email: email.value || undefined
    });
  };

  const downloadUrl = utils.files.generateDownloadUrl({
    orgId: debtPositionResponse?.organizationId,
    nav: debtPositionResponse?.paymentDetails?.nav,
    isAnonymous,
    fiscalCode: fiscalCode.value
  });

  return (
    <>
      <Card variant="elevation" data-testid="spontanei-step4-payment-container" sx={{ padding: 2 }}>
        <Stack gap={4}>
          <Stack gap={1}>
            <Typography variant="h4" component="h2">
              {t('spontanei.form.steps.step5.title')}
            </Typography>
            <Typography>{t('spontanei.form.steps.step5.description')}</Typography>
          </Stack>

          <ResponsiveCard variant="outlined" data-testid="payment-methods-card">
            <SpacedStack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between">
              <Stack>
                <Typography variant="h6" component="h3" fontWeight="600">
                  {t('spontanei.form.steps.step5.pay.title')}
                </Typography>
                <Typography fontSize="16px" fontWeight="400" color="action.active">
                  {t('spontanei.form.steps.step5.pay.description')}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={2}>
                {appStore.value.brokerInfo?.config?.useCart && (
                  <Button
                    size="large"
                    variant="text"
                    sx={{ padding: 0 }}
                    onClick={addToCart}
                    startIcon={<ShoppingCartIcon />}
                    data-testid="add-to-cart-button">
                    {t('spontanei.form.steps.step5.pay.addItemToCartButton')}
                  </Button>
                )}
                <Button size="large" variant="contained" onClick={pay} data-testid="pay-button">
                  {t('spontanei.form.steps.step5.pay.payButton')}
                </Button>
              </Stack>
            </SpacedStack>
          </ResponsiveCard>

          <ResponsiveCard variant="outlined" data-testid="download-notice-card">
            <SpacedStack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between">
              <Stack>
                <Typography variant="h6" component="h3" fontWeight="600">
                  {t('spontanei.form.steps.step5.download.title')}
                </Typography>
                <Typography fontSize="16px" fontWeight="400" color="action.active">
                  {t('spontanei.form.steps.step5.download.description')}
                </Typography>
              </Stack>
              <Stack direction="row">
                <Button
                  sx={{ padding: 0 }}
                  variant="text"
                  size="large"
                  startIcon={<FileDownloadIcon />}
                  data-testid="download-notice-button"
                  component={Link}
                  target="_blank"
                  to={downloadUrl}>
                  {t('spontanei.form.steps.step5.download.downloadButton')}
                </Button>
              </Stack>
            </SpacedStack>
          </ResponsiveCard>
        </Stack>
      </Card>
    </>
  );
};

export default Payment;
