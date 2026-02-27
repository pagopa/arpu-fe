import React from 'react';
import withComputedValues, { computedPROPS } from './withDinamicValues';
import AUTOCOMPLETE from './AUTOCOMPLETE';

const DYNAMIC_SELECT = (props: computedPROPS & { multiple?: boolean }) => (
  <AUTOCOMPLETE {...props} />
);

export default withComputedValues(DYNAMIC_SELECT);
