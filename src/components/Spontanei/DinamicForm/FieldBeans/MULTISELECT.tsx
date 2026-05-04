import React from 'react';
import SELECT from './SELECT';
import withComputedValues, { computedPROPS } from './withDinamicValues';

const MULTISELECT = (props: computedPROPS) => <SELECT {...props} multiple />;

export default withComputedValues(MULTISELECT);
