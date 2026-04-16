import React from 'react';

import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Stack, Tab } from '@mui/material';
import { BuildFormInputs, FieldBeanPros, computeValue } from '../config';
import { useField, useFormikContext } from 'formik';
import withComputedValues, { computedPROPS } from './withDinamicValues';

export const TABold = (props: FieldBeanPros) => {
  const { input } = props;
  const { name } = input;
  const [field, , { setValue }] = useField(name);
  const defaultValue = input.defaultValue || (input.subfields && input.subfields[0].name);
  const value = field.value || defaultValue;
  //const { values } = useFormikContext();

  return (
    <TabContext value={value}>
      <TabList variant="fullWidth" onChange={(_, value) => setValue(value)}>
        {input.subfields?.map((field) => {
          return <Tab label={field.htmlLabel} value={field.name} />;
        })}
      </TabList>
      {input.subfields?.map((field) => {
        return (
          <TabPanel value={field.name} key={field.name} sx={{ padding: 0 }}>
            <fieldset style={{ padding: '16px' }}>
              <Stack gap={2} direction="row">
                {BuildFormInputs(field.subfields || [])}
              </Stack>
            </fieldset>
          </TabPanel>
        );
      })}
    </TabContext>
  );
};

const TAB = (props: computedPROPS) => {
  const { value, subfields, onChange } = props;
  //const defaultValue = input.defaultValue || (input.subfields && input.subfields[0].name);
  //const value = field.value || defaultValue;
  //const { values } = useFormikContext();

  return (
    <TabContext value={"tab_belluno"}>
      <TabList variant="fullWidth" onChange={(_, value) => onChange(value)}>
        {subfields?.map((field) => {
          // const { enabledDependsOn } = field;
          // const hasEnabledDependsOn = Boolean(enabledDependsOn);

          // const enabled =
          //   hasEnabledDependsOn && enabledDependsOn
          //     ? computeValue(enabledDependsOn, values)
          //     : false;
          return <Tab label={field.htmlLabel} value={field.name} />;
        })}
      </TabList>
      {subfields?.map((field) => {
        // const { enabledDependsOn } = field;
        // const hasEnabledDependsOn = Boolean(enabledDependsOn);

        // const enabled =
        //   hasEnabledDependsOn && enabledDependsOn ? computeValue(enabledDependsOn, values) : false;
        return (
          <TabPanel value={field.name} key={field.name} sx={{ padding: 0 }}>
            <fieldset style={{ padding: '16px' }}>
              <Stack gap={2} direction="row">
                {
                  (() => {
                    return BuildFormInputs(field.subfields || [])
                  })()
                }
              </Stack>
            </fieldset>
          </TabPanel>
        );
      })}
    </TabContext>
  );
};

export default withComputedValues(TAB);


