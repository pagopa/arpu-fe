import React, { useContext, useEffect, useRef } from 'react';
import {
  Autocomplete,
  Divider,
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
import FormContext, { FormContextType } from '../FormContext';
import { Box } from '@mui/system';
import getLocalizedDescription from '../GetLocalizedDescription';

const LIMIT_DEBT_TYPE = 10;

/**
 * This component is responsible for selecting the debt type. As second step of Spontanei form.
 * @returns JSX.Element
 */
const DebtTypeSelect = () => {
  const { t, i18n } = useTranslation();
  const brokerId = utils.storage.app.getBrokerId();
  const isAnonymous = utils.storage.user.isAnonymous();
  const context = useContext<FormContextType | null>(FormContext);
  const formik = useFormikContext<PaymentNoticeInfo>();
  const [org] = useField<PaymentNoticeInfo['org']>('org');
  const [debtType, debtTypeMeta, debtTypeHelpers] =
    useField<PaymentNoticeInfo['debtType']>('debtType');
  const firstRadioRef = useRef<HTMLInputElement>(null);

  const organizationId = org.value?.organizationId || 0;

  const {
    data: DebtPositionTypeOrgsWithSpontaneous,
    isPending: isDebtPositionTypeOrgsWithSpontaneousPending
  } = isAnonymous
    ? utils.loaders.public.getPublicDebtPositionTypeOrgsWithSpontaneous(brokerId, organizationId)
    : utils.loaders.getDebtPositionTypeOrgsWithSpontaneous(brokerId, organizationId);

  const debtTypeOptions: DebtPositionTypeOrgsWithSpontaneousDTO[] =
    DebtPositionTypeOrgsWithSpontaneous || [];

  const handleDebtTypeChange = (
    _event: React.SyntheticEvent<Element, Event> | null,
    value: string | DebtPositionTypeOrgsWithSpontaneousDTO | null
  ) => {
    if (!value) {
      debtTypeHelpers.setValue(null);
      return;
    }
    // if value isn't a string, it means it's an option from the autocomplete
    if (typeof value !== 'string') {
      debtTypeHelpers.setValue(value);
    } else {
      // if value is a string, it means it's an option from the radio group
      const debtPositionTypeOrgId: DebtPositionTypeOrgsWithSpontaneousDTO['debtPositionTypeOrgId'] =
        parseInt(value, 10);
      const selectedDebtType = debtTypeOptions.find(
        (debtTypeOption) => debtTypeOption.debtPositionTypeOrgId === debtPositionTypeOrgId
      );
      if (selectedDebtType) {
        debtTypeHelpers.setValue(selectedDebtType);
      } else {
        // if value is not found, set it to null
        debtTypeHelpers.setValue(null);
      }
    }
  };

  const debtTypeOptionsLength = DebtPositionTypeOrgsWithSpontaneous?.length || 0;

  const shouldShowMostUsedDebtTypes = debtTypeOptionsLength > LIMIT_DEBT_TYPE;

  const mostUsedDebtTypesQuery = isAnonymous
    ? utils.loaders.public.getPublicMostUsedSpontaneousDebtPositionTypeOrgsForCurrentYear(
        brokerId,
        organizationId,
        shouldShowMostUsedDebtTypes
      )
    : utils.loaders.getMostUsedSpontaneousDebtPositionTypeOrgsForCurrentYear(
        brokerId,
        organizationId,
        shouldShowMostUsedDebtTypes
      );

  const onChange = async (debtType: DebtPositionTypeOrgsWithSpontaneousDTO) => {
    await formik.validateForm();
    await debtTypeHelpers.setValue(debtType);
    await formik.setFieldValue('description', '', true);
  };

  const shouldContinue = async () => {
    formik.setTouched({ debtType: true });
    const errors = await formik.validateForm();
    if (errors.debtType) {
      firstRadioRef.current?.focus();
    }
    return !errors.org && !errors.debtType;
  };

  useEffect(() => {
    context?.setCausaleHasJoinTemplate(false);
  }, []);

  const errorMessage = formik.touched.debtType ? formik.errors.debtType : '';

  return (
    <>
      <StepWrapper isPending={isDebtPositionTypeOrgsWithSpontaneousPending}>
        <Stack gap={{ xs: 2, md: 3 }} padding={2}>
          <Stack gap={1}>
            <Typography variant="h5" component="h2" data-testid="spontanei-step2-title">
              {t('spontanei.form.steps.step2.title')}
            </Typography>
            <Typography data-testid="spontanei-step2-description" variant="body2">
              {t('spontanei.form.steps.step2.description')}
            </Typography>
          </Stack>
          {!shouldShowMostUsedDebtTypes ? (
            <FormControl>
              <RadioGroup
                aria-labelledby="spontanei-step2-radioGroup"
                name="controlled-radio-buttons-group"
                value={debtType.value?.debtPositionTypeOrgId}
                onChange={handleDebtTypeChange}>
                {debtTypeOptions.map((debtTypeOption, index) => (
                  <Box key={debtTypeOption.debtPositionTypeOrgId}>
                    <FormControlLabel
                      variant="radio"
                      value={debtTypeOption.debtPositionTypeOrgId}
                      control={<Radio inputRef={index === 0 ? firstRadioRef : null} />}
                      label={getLocalizedDescription(
                        debtTypeOption.descriptionI18n,
                        i18n.language,
                        debtTypeOption.description
                      )}
                    />
                    {index !== debtTypeOptions.length - 1 && <Divider aria-hidden="true" />}
                  </Box>
                ))}
              </RadioGroup>
            </FormControl>
          ) : (
            <Autocomplete
              data-testid="spontanei-step2-search-input"
              onChange={handleDebtTypeChange}
              freeSolo
              options={debtTypeOptions}
              value={debtType.value}
              getOptionKey={(option) =>
                (option as DebtPositionTypeOrgsWithSpontaneousDTO).debtPositionTypeOrgId
              }
              getOptionLabel={(option) => {
                const item = option as DebtPositionTypeOrgsWithSpontaneousDTO;
                return getLocalizedDescription(
                  item.descriptionI18n,
                  i18n.language,
                  item.description
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={t('spontanei.form.steps.step2.search')}
                  error={!!errorMessage}
                />
              )}
            />
          )}
          {shouldShowMostUsedDebtTypes &&
            mostUsedDebtTypesQuery.data &&
            mostUsedDebtTypesQuery.data.length > 0 && (
              <>
                <Typography variant="subtitle1" data-testid="spontanei-step2-mostUsedDebtTypes">
                  {t('spontanei.form.steps.step2.mostUsedDebtTypes')}
                </Typography>
                <FormControl>
                  <RadioGroup
                    aria-label="debt-type"
                    name="debtTypeCode"
                    data-testid="spontanei-step2-radioGroup"
                    value={debtType.value?.debtPositionTypeOrgId}>
                    {mostUsedDebtTypesQuery.data.map((MostUsedDebtType, index) => (
                      <Box key={MostUsedDebtType.debtPositionTypeOrgId}>
                        <FormControlLabel
                          variant="radio"
                          value={MostUsedDebtType.debtPositionTypeOrgId}
                          control={
                            <Radio
                              inputRef={index === 0 ? firstRadioRef : null}
                              onChange={() => onChange(MostUsedDebtType)}
                            />
                          }
                          label={getLocalizedDescription(
                            MostUsedDebtType.descriptionI18n,
                            i18n.language,
                            MostUsedDebtType.description
                          )}
                        />
                        {index !== mostUsedDebtTypesQuery.data!.length - 1 && (
                          <Divider aria-hidden="true" />
                        )}
                      </Box>
                    ))}
                  </RadioGroup>
                </FormControl>
              </>
            )}
          {debtTypeMeta.touched && debtTypeMeta.error && (
            <Typography color="error">{t(debtTypeMeta.error)}</Typography>
          )}
        </Stack>
      </StepWrapper>
      <Controls shouldContinue={shouldContinue} />
    </>
  );
};

export default DebtTypeSelect;
