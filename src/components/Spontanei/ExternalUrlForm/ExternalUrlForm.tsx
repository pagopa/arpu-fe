import { Button, Card, Stack, Typography } from '@mui/material';
import React from 'react';
import Controls from '../Controls';

const ExternalUrlForm = (props: { link: string }) => {
  return (
    <>
      <Card variant="outlined">
        <Stack spacing={2} padding={4}>
          <Typography variant="body2" fontWeight={600} component="h3">
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
