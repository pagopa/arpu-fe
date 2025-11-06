import { Button, Card, Stack, Typography } from '@mui/material';
import React, { useContext } from 'react';
import Controls from '../Controls';
import { useTranslation } from 'react-i18next';
import { addItem, deleteItem, isItemInCart, toggleCartDrawer } from 'store/CartStore';
import notify from 'utils/notify';
import { useStore } from 'store/GlobalStore';
import utils from 'utils';
import { useParams } from 'react-router-dom';
import { DebtPositionRequestDTO } from '../../../../generated/arpu-be/data-contracts';
import { useField } from 'formik';
import { PaymentNoticeInfo } from '..';
import FormContext, { FormContextType } from '../FormContext';

const Payment = () => {
  const context = useContext<FormContextType | null>(FormContext);

  const [fullName] = useField<PaymentNoticeInfo['fullName']>('fullName');
  const [amount] = useField<PaymentNoticeInfo['amount']>('amount');
  const [description] = useField<PaymentNoticeInfo['description']>('description');
  const [fiscalCode] = useField<PaymentNoticeInfo['fiscalCode']>('fiscalCode');
  const [entityType] = useField<PaymentNoticeInfo['entityType']>('entityType');
  const [email] = useField<PaymentNoticeInfo['email']>('email');

  const organizationId = context?.org?.organizationId;
  const debtPositionTypeOrgId = context?.debtType?.debtPositionTypeOrgId;

  const { brokerId = '1' } = useParams();

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
        totalAmountCents: amount.value * 100,
        installments: [
          {
            amountCents: amount.value * 100,
            remittanceInformation: description.value,
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

  const { data: debtPositionResponse } = utils.loaders.createSpontaneousDebtPosition(
    Number(brokerId),
    body
  );

  console.log(debtPositionResponse);

  const addToCart = () => {
    if (!debtPositionResponse) return;
    const { orgFiscalCode, orgName, paymentDetails } = debtPositionResponse;
    const { iuv, amountCents: amount, nav, remittanceInformation: description } = paymentDetails;
    if (!iuv || !nav) return;
    if (isItemInCart(iuv)) return deleteItem(iuv);
    if (cart.items.length >= 5) return notify.emit(t('app.cart.items.full'), 'error');
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

  return (
    <>
      <Card variant="outlined">
        <Stack spacing={2} padding={4}>
          <Typography variant="h6">{t('spontanei.form.steps.step5.title')}</Typography>
          <Typography>{t('spontanei.form.steps.step5.description')}</Typography>

          <Card variant="outlined">
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
                <Button variant="text" onClick={addToCart}>
                  {t('spontanei.form.steps.step5.pay.addItemToCartButton')}
                </Button>
                <Button variant="contained">{t('spontanei.form.steps.step5.pay.payButton')}</Button>
              </Stack>
            </Stack>
          </Card>

          <Card variant="outlined">
            <Stack spacing={2} padding={4} direction="row" justifyContent="space-between">
              <Stack>
                <Typography fontSize="18px" fontWeight="600">
                  {t('spontanei.form.steps.step5.download.title')}
                </Typography>
                <Typography fontSize="16px" fontWeight="400" color="action.active">
                  {t('spontanei.form.steps.step5.download.description')}
                </Typography>
              </Stack>
              <Button variant="text">
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
