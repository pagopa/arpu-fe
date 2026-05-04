import { Card, Skeleton } from '@mui/material';
import React, { useEffect } from 'react';

const StepWrapper = ({
  children,
  isPending
}: {
  children: React.ReactNode;
  isPending: boolean;
}) => {
  const [viewSkeleton, setViewSkeleton] = React.useState(true);

  useEffect(() => {
    if (!isPending) {
      setTimeout(() => {
        setViewSkeleton(false);
      }, 1000);
    }
  }, [isPending]);

  return (
    <>
      <Card variant="elevation">
        {viewSkeleton ? (
          <Skeleton
            variant="rectangular"
            height={'450px'}
            sx={{ p: 4 }}
            animation={'wave'}></Skeleton>
        ) : (
          children
        )}
      </Card>
    </>
  );
};

export default StepWrapper;
