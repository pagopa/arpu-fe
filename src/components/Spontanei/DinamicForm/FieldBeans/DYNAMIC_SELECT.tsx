import React from 'react';
import withComputedValues, { computedPROPS } from './withDinamicValues';
import SELECT from './SELECT';

const DYNAMIC_SELECT = (props: computedPROPS & { multiple?: boolean }) => <SELECT {...props} />;

export default withComputedValues(DYNAMIC_SELECT);
