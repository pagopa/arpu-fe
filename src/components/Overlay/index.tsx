import { CircularProgress, Grid, Portal } from '@mui/material';
import React, { useEffect } from 'react';
import { useIsFetching, useIsMutating } from '@tanstack/react-query';

/** If the loading time is less than this value (ms), the spinner will not be shown */
const min = 400;
/* if the loading time is greater than min, the spinner will be shown at least this value (ms) */
const atLeast = 800;
/**  these two variables are legits becuase this component is used as a single instace */
let startTime = 0;
let endTime = 0;

type OverlayProps = {
  /** if used the internal visibility logics is ignored and the prop's value needs to be switched properly */
  visible?: boolean;
};

export const Overlay = (props: OverlayProps): React.ReactElement => {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  const [loading, setLoading] = React.useState(false);
  const [timeoutId, setTimeoutId] = React.useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    /** this means that that pending state ended */
    if (isFetching + isMutating === 0) {
      if (timeoutId) clearTimeout(timeoutId);
      endTime = Date.now();
      if (endTime - startTime < min) {
        setTimeout(() => setLoading(false), atLeast);
        return;
      }
      setLoading(false);
    }
    /** this means that that pending has started */
    if (isFetching + isMutating > 0) {
      /** this clear is necessary because the pending state can start multiple times */
      if (timeoutId) clearTimeout(timeoutId);
      startTime = Date.now();
      /** do not show the spinner if the loading time is less than min value */
      setTimeoutId(setTimeout(() => setLoading(true), min));
    }
  }, [isFetching, isMutating]);

  useEffect(() => {
    if (props.visible || loading) {
      document.body.style.overflow = 'hidden';
      return;
    }
    document.body.style.overflow = 'auto';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [props.visible, loading]);

  return loading || props.visible ? (
    <Portal>
      <Grid sx={style.overlay} data-testid="overlay-background" />
      <Grid sx={style.background} alignItems="center" justifyContent="center" container>
        <CircularProgress
          sx={{ position: 'absolute', top: '40%' }}
          color="primary"
          role="status"
          aria-live="assertive"
          size="50px"
        />
      </Grid>
    </Portal>
  ) : (
    <React.Fragment />
  );
};

const style = {
  background: {
    backgroundColor: 'background.default'
  },
  overlay: {
    position: 'fixed',
    display: 'flex',
    WebkitBoxAlign: 'center',
    alignItems: 'center',
    WebkitBoxPack: 'center',
    justifyContent: 'center',
    inset: '0px',
    WebkitTapHighlightColor: 'transparent',
    backgroundColor: 'rgba(23, 50, 77, 0.7)',
    margin: 0,
    height: '100%',
    overflow: 'hidden',
    zIndex: 10
  }
};
