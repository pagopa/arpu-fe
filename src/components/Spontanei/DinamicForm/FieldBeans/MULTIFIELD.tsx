import { Box, Card, CardContent } from '@mui/material';
import { BuildFormInputs, FieldBeanPros } from '../config';
import React from 'react';

const MULTFIELD = (props: FieldBeanPros) => {
  const { input } = props;
  return (
    <Card variant="outlined">
      <CardContent>
        <Box display={'flex'} flexDirection="column" mb={2} gap={2}>
          <h3>{input.htmlLabel}</h3>
          {BuildFormInputs(input.subfields || [], false)}
        </Box>
      </CardContent>
    </Card>
  );
};

export default MULTFIELD;
