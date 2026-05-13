import React from 'react';
import { Button, Typography, Container, Box } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { OUTCOMES } from '../../routes/routes';
import i18next from 'i18next';
import { CourtesyPageActions } from './components/CourtesyPageActions';
import { useAppRoutes } from 'hooks/useAppRoutes';
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

export const CourtesyPage = () => {
  const { t } = useTranslation();
  const { routes } = useAppRoutes();
  const params = useParams();
  const outcome = params?.outcome as keyof typeof OUTCOMES;
  const code = OUTCOMES[outcome];
  const isAnonymous = utils.storage.user.isAnonymous();

  // Custom actions (via CourtesyPageActions) are used when:
  //   - KO / CANCEL outcomes (both flows: retry / download / home)
  //   - OK outcome in the AUTHENTICATED flow (shows "Torna alla home" -> DASHBOARD)
  //
  // The anonymous OK case keeps the legacy single-button rendering below
  // (driven by the i18n `cta` key).
  const hasCustomActions =
    code === OUTCOMES['pagamento-non-riuscito'] ||
    code === OUTCOMES['pagamento-annullato'] ||
    (code === OUTCOMES['pagamento-avviso-completato'] && !isAnonymous);

  // The OK outcome (420) has distinct title/body for the authenticated flow:
  // it lives under `420.auth.*`.
  // For all other cases we use the flat `courtesyPage.{code}.*` keys.
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
