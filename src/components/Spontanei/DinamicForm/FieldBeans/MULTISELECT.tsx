import React from 'react';
import AUTOCOMPLETE from './AUTOCOMPLETE';
import withComputedValues, { computedPROPS } from './withDinamicValues';

const MULTISELECT = (props: computedPROPS) => <AUTOCOMPLETE {...props} multiple />;

export default withComputedValues(MULTISELECT);
