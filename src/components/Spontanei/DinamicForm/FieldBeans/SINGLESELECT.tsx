import AUTOCOMPLETE from './AUTOCOMPLETE';
import React from 'react';
import withComputedValues, { computedPROPS } from './withDinamicValues';

const SINGLESELECT = (props: computedPROPS) => <AUTOCOMPLETE {...props} />;

export default withComputedValues(SINGLESELECT);
