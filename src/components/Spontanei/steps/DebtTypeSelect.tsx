import React from 'react';
import {
  Autocomplete,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import utils from 'utils';
import { DebtPositionTypeOrgsWithSpontaneousDTO } from '../../../../generated/data-contracts';
import Controls from '../Controls';
import { useField, useFormikContext } from 'formik';
import { PaymentNoticeInfo } from '..';
import StepWrapper from './StepWrapper';

/**
 * This component is responsible for selecting the debt type. As second step of Spontanei form.
 * @returns JSX.Element
 */
const DebtTypeSelect = () => {
  const { t } = useTranslation();
  const brokerId = utils.storage.app.getBrokerId();
  const isAnonymous = utils.storage.user.isAnonymous();

  const formik = useFormikContext<PaymentNoticeInfo>();

  const [org] = useField<PaymentNoticeInfo['org']>('org');
  const [debtType, debtTypeMeta, debtTypeHelpers] =
    useField<PaymentNoticeInfo['debtType']>('debtType');

  const organizationId = org.value?.organizationId || 0;

  const { data: DebtPositionTypeOrgsWithSpontaneous } = isAnonymous
    ? utils.loaders.public.getPublicDebtPositionTypeOrgsWithSpontaneous(brokerId, organizationId)
    : utils.loaders.getDebtPositionTypeOrgsWithSpontaneous(brokerId, organizationId);

  const debtTypeOptions: DebtPositionTypeOrgsWithSpontaneousDTO[] =
    DebtPositionTypeOrgsWithSpontaneous || [];

  const handleDebtTypeChange = (
    _event: React.SyntheticEvent<Element, Event> | null,
    value: string | DebtPositionTypeOrgsWithSpontaneousDTO | null
  ) => {
    if (value && typeof value !== 'string') {
      debtTypeHelpers.setValue(value);
    } else {
      debtTypeHelpers.setValue(null);
    }
  };

  const mostUsedDebtTypesQuery = isAnonymous
    ? utils.loaders.public.getPublicMostUsedSpontaneousDebtPositionTypeOrgsForCurrentYear(
      brokerId,
      organizationId
    )
    : utils.loaders.getMostUsedSpontaneousDebtPositionTypeOrgsForCurrentYear(
      brokerId,
      organizationId
    );

  const onChange = async (debtType: DebtPositionTypeOrgsWithSpontaneousDTO) => {
    await formik.validateForm();
    await debtTypeHelpers.setValue(debtType);
    await formik.setFieldValue('description', '', true);
  };

  const shouldContinue = async () => {
    formik.setTouched({ debtType: true });
    const errors = await formik.validateForm();
    return !errors.org && !errors.debtType;
  };

  const errorMessage = formik.touched.debtType ? formik.errors.debtType : '';

  return (
    <>
      <StepWrapper isPending={mostUsedDebtTypesQuery.isPending}>
        <Stack spacing={2} padding={4}>
          <Typography variant="h6" data-testid="spontanei-step2-title">
            {t('spontanei.form.steps.step2.title')}
          </Typography>
          <Typography data-testid="spontanei-step2-description">
            {t('spontanei.form.steps.step2.description')}
          </Typography>
          <Autocomplete
            data-testid="spontanei-step2-search-input"
            onChange={handleDebtTypeChange}
            freeSolo
            options={debtTypeOptions}
            value={debtType.value}
            getOptionKey={(option) =>
              (option as DebtPositionTypeOrgsWithSpontaneousDTO).debtPositionTypeOrgId
            }
            getOptionLabel={(option) =>
              (option as DebtPositionTypeOrgsWithSpontaneousDTO).description
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label={t('spontanei.form.steps.step2.search')}
                error={!!errorMessage}
              />
            )}
          />
          {mostUsedDebtTypesQuery.data && mostUsedDebtTypesQuery.data.length > 0 && (
            <>
              <Typography variant="subtitle1" data-testid="spontanei-step2-mostUsedDebtTypes">
                {t('spontanei.form.steps.step2.mostUsedDebtTypes')}
              </Typography>
              <Stack
                sx={{
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: errorMessage ? 'error.main' : 'grey.300',
                  px: 4,
                  py: 2
                }}
                spacing={2}>
                <RadioGroup
                  aria-label="debt-type"
                  name="debtTypeCode"
                  data-testid="spontanei-step2-radioGroup">
                  {mostUsedDebtTypesQuery.data.map((MostUsedDebtType) => (
                    <FormControl key={MostUsedDebtType.debtPositionTypeOrgId}>
                      <FormControlLabel
                        value={MostUsedDebtType.debtPositionTypeOrgId}
                        control={
                          <Radio
                            onChange={() => onChange(MostUsedDebtType)}
                            checked={
                              debtType?.value?.debtPositionTypeOrgId ===
                              MostUsedDebtType.debtPositionTypeOrgId
                            }
                          />
                        }
                        label={MostUsedDebtType.description}
                      />
                    </FormControl>
                  ))}
                </RadioGroup>
              </Stack>
              {debtTypeMeta.touched && <Typography color="error">{debtTypeMeta.error}</Typography>}
            </>
          )}
        </Stack>
      </StepWrapper>
      <Controls shouldContinue={shouldContinue} />
    </>
  );
};

export default DebtTypeSelect;
