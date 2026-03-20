import Card, { CardProps } from '@mui/material/Card';
import React from 'react';

export const ResponsiveCard = (props: CardProps) => {
  return (
    <Card
      {...props}
      sx={{
        padding: { xs: 0, sm: 3 },
        borderWidth: { xs: 0, sm: '1px' },
        borderRadius: { xs: 0, sm: '5px' },
        ...props.sx
      }}>
      {props.children}
    </Card>
  );
};
