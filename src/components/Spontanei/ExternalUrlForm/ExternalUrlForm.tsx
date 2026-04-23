import { Button, Card, Stack, Typography } from '@mui/material';
import React from 'react';
import Controls from '../Controls';

const ExternalUrlForm = (props: { link: string }) => {
  return (
    <>
      <Card variant="outlined">
        <Stack gap={1} padding={4}>
          <Typography variant="h5" component="h2">
            External URL
          </Typography>
          <Button variant="outlined" size="large" href={props.link} target="_blank" rel="noopener">
            Open Link
          </Button>
        </Stack>
      </Card>
      <Controls shouldContinue={() => false} />
    </>
  );
};

export default ExternalUrlForm;
