import React from 'react';
import { Button, Typography, Container, Box, Stack } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { OUTCOMES } from '../../routes/routes';
import i18next from 'i18next';
import { CourtesyPageActions } from './components/CourtesyPageActions';
import { useAppRoutes } from 'hooks/useAppRoutes';
import { useStore } from 'store/GlobalStore';
import { useCheckoutRetry, useEmptyCartGuard } from './hooks/useCourtesyPageActions';
import utils from 'utils';

interface ErrorIconComponentProps {
  code?: OUTCOMES;
}

export const ErrorIconComponent: React.FC<ErrorIconComponentProps> = ({ code }) => {
  switch (code) {
    case OUTCOMES['pagamento-avviso-completato']:
      return <img src="/cittadini/pictograms/paymentcompleted.svg" title="OK" aria-hidden="true" />;
    case OUTCOMES['accesso-non-autorizzato']:
    case OUTCOMES['avviso-non-pagabile']:
    case OUTCOMES['avvisi-rimossi-dal-carrello']:
      return <img src="/cittadini/pictograms/genericerror.svg" title="Error" aria-hidden="true" />;
    case OUTCOMES['pagamento-non-riuscito']:
    case OUTCOMES['pagamento-annullato']:
      return <img src="/cittadini/pictograms/warning.svg" title="Error" aria-hidden="true" />;
    case OUTCOMES['sessione-scaduta']:
      return <img src="/cittadini/pictograms/expired.svg" title="Expired" aria-hidden="true" />;
    case OUTCOMES['verifica-non-riuscita']:
      return (
        <img
          src="/cittadini/pictograms/genericerror.svg"
          title="Verification failed"
          aria-hidden="true"
        />
      );
    case OUTCOMES['avvio-pagamento']:
    case OUTCOMES['sconosciuto']:
      return (
        <img
          src="/cittadini/pictograms/umbrella.svg"
          title="Something went wrong"
          aria-hidden="true"
        />
      );
    default:
      return (
        <img
          src="/cittadini/pictograms/umbrella.svg"
          title="Something went wrong"
          aria-hidden="true"
        />
      );
  }
};

/**
 * Actions for the "avvisi-rimossi-dal-carrello" (428) outcome: after the cart
 * checkout returned 422 and the already-paid notices were dropped, let the user
 * retry the payment with what remains in the cart. If nothing remains (every
 * notice was paid), there's nothing to retry: fall back to the generic outcome.
 */
export const CartRetryActions: React.FC<{ code: OUTCOMES }> = ({ code }) => {
  const { t } = useTranslation();
  const { routes } = useAppRoutes();
  const {
    state: { cart }
  } = useStore();

  useEmptyCartGuard(true, routes.COURTESY_PAGE, cart.items.length === 0);

  const { postCarts, retry } = useCheckoutRetry();

  const handleRetry = () => {
    if (cart.items.length === 0) return;
    retry(cart.items, cart.email);
  };

  return (
    <Stack gap={2} alignItems="center">
      <Button
        variant="contained"
        size="large"
        color="primary"
        onClick={handleRetry}
        disabled={postCarts.isPending || cart.items.length === 0}
        data-testid="courtesyPage.cta">
        {t(`courtesyPage.${code}.cta`)}
      </Button>

      <Button
        component="a"
        href={routes.DASHBOARD}
        variant="text"
        data-testid="courtesyPage.homeCta">
        {t(`courtesyPage.${code}.homeCta`)}
      </Button>
    </Stack>
  );
};

export const CourtesyPage = () => {
  const { t } = useTranslation();
  const { routes } = useAppRoutes();
  const params = useParams();
  const outcome = params?.outcome as keyof typeof OUTCOMES;
  const code = OUTCOMES[outcome];
  const isAnonymous = utils.storage.user.isAnonymous();

  // Custom actions (via CourtesyPageActions) are used when:
  //   - KO / CANCEL outcomes (both flows: retry / download / home)
  //   - OK outcome in BOTH flows:
  //       * authenticated -> "Torna alla home" -> DASHBOARD
  //       * anonymous     -> "Scarica ricevuta" + link al login
  const hasCustomActions =
    code === OUTCOMES['pagamento-non-riuscito'] ||
    code === OUTCOMES['pagamento-annullato'] ||
    code === OUTCOMES['pagamento-avviso-completato'];

  // Paid notices removed from the cart: offer a retry of the remaining cart.
  const isRemovedFromCart = code === OUTCOMES['avvisi-rimossi-dal-carrello'];

  // The OK outcome (420) has distinct title/body for the authenticated flow:
  // it lives under `420.auth.*`. The anonymous OK flow keeps the flat keys
  // (`courtesyPage.420.title`, `.body`, `.cta`, `.secondaryCta`, `.downloadCta`).
  const i18nPrefix =
    code === OUTCOMES['pagamento-avviso-completato'] && !isAnonymous
      ? `courtesyPage.${code}.auth`
      : `courtesyPage.${code}`;

  const getCtaHref = (code: OUTCOMES): string => {
    if (code === OUTCOMES['verifica-non-riuscita']) {
      return routes.public.PAYMENTS_ON_THE_FLY;
    }
    return routes.LOGIN;
  };

  return (
    <Container
      fixed
      disableGutters
      id="courtesyPage"
      sx={{
        display: 'flex',
        alignItems: 'center',
        minHeight: '70vh',
        justifyContent: 'center',
        paddingBottom: 15
      }}>
      <Box textAlign="center" mt={10} mb={10} maxWidth={(theme) => theme.spacing(48)}>
        <Box my={3}>
          <ErrorIconComponent code={code} />
        </Box>
        <Typography variant="h4" gutterBottom data-testid="courtesyPage.title">
          {t(`${i18nPrefix}.title`, {
            defaultValue: t('courtesyPage.default.title')
          })}
        </Typography>
        <Typography variant="body1" paragraph data-testid="courtesyPage.body">
          {t(`${i18nPrefix}.body`, {
            defaultValue: t('courtesyPage.default.body')
          })}
        </Typography>

        {hasCustomActions ? (
          <CourtesyPageActions code={code} />
        ) : isRemovedFromCart ? (
          <CartRetryActions code={code} />
        ) : (
          i18next.exists(`courtesyPage.${code}.cta`) && (
            <Button
              component="a"
              href={getCtaHref(code)}
              variant="contained"
              size="large"
              color="primary"
              data-testid="courtesyPage.cta">
              {t(`courtesyPage.${code}.cta`, {
                defaultValue: t('courtesyPage.default.cta')
              })}
            </Button>
          )
        )}
      </Box>
    </Container>
  );
};
