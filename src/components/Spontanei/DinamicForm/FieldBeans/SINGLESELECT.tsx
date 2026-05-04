import SELECT from './SELECT';
import React from 'react';
import withComputedValues, { computedPROPS } from './withDinamicValues';

const SINGLESELECT = (props: computedPROPS) => <SELECT {...props} />;

export default withComputedValues(SINGLESELECT);
