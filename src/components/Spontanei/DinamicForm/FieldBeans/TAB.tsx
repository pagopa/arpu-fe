import React from 'react';

import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Stack, Tab } from '@mui/material';
import { BuildFormInputs, computeValue } from '../config';
import { useField, useFormikContext } from 'formik';
import withComputedValues, { computedPROPS } from './withDinamicValues';

const TABPANEL = withComputedValues((props: computedPROPS) => {
  const { name, subfields, isDisabled } = props;
  return (
    <TabPanel value={name} key={name} sx={{ padding: 0 }}>
      <fieldset style={{ padding: '16px' }} disabled={isDisabled}>
        <Stack gap={2} direction="row">
          {BuildFormInputs(subfields || [])}
        </Stack>
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

  const { values } = useFormikContext();

  const firstTabValue = subfields?.[0]?.name;
  const value = fieldValue.value || firstTabValue || '';

  return (
    <Stack direction="column">
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
        {subfields?.map((field) => <TABPANEL {...field} />)}
      </TabContext>
    </Stack>
  );
};

export default withComputedValues(TABLIST);
