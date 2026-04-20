import React from 'react';

import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Tab } from '@mui/material';
import { BuildFormInputs, computeValue, CustomFormValues } from '../config';
import { useField, useFormikContext } from 'formik';
import withComputedValues, { computedPROPS } from './withDinamicValues';
import { Box, Grid } from '@mui/system';

const TABPANEL = withComputedValues((props: computedPROPS) => {
  const { name, subfields, isDisabled } = props;
  return (
    <TabPanel value={name} sx={{ padding: 0 }}>
      <fieldset style={{ padding: '16px' }} disabled={isDisabled}>
        <Grid container spacing={2}>
          {subfields?.map((field) => (
            <Grid size={{ xs: 12, md: 6, lg: 6 }} key={field.name}>
              {BuildFormInputs([field])}
            </Grid>
          ))}
        </Grid>
      </fieldset>
    </TabPanel>
  );
});

const TABLIST = (props: computedPROPS) => {
  const { name, subfields } = props;
  const [fieldValue, , helpers] = useField<string>(name);
  const handleChange = (_event: React.SyntheticEvent, newValue: string) => {
    helpers.setValue(newValue);
  };

  const { values } = useFormikContext<CustomFormValues>();

  const firstTabValue = subfields?.[0]?.name;
  const value = fieldValue.value || firstTabValue || '';

  return (
    <Box minWidth={'100%'}>
      <TabContext value={value}>
        <TabList onChange={handleChange} variant="fullWidth">
          {subfields?.map((field) => {
            const { enabledDependsOn } = field;
            const hasEnabledDependsOn = Boolean(enabledDependsOn);

            const enabled =
              hasEnabledDependsOn && enabledDependsOn
                ? computeValue(enabledDependsOn, values)
                : false;
            return (
              <Tab
                key={field.name}
                label={field.htmlLabel || ''}
                value={field.name}
                disabled={!enabled}
              />
            );
          })}
        </TabList>
        {subfields?.map((field) => <TABPANEL {...field} key={field.name} />)}
      </TabContext>
    </Box>
  );
};

export default withComputedValues(TABLIST);
