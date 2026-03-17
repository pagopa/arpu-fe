import React from 'react';
import { Button, Typography, Container, Box } from '@mui/material';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { OUTCOMES } from '../../routes/routes';
import i18next from 'i18next';
import { CourtesyPageActions } from './components/CourtesyPageActions';
import { useAppRoutes } from 'hooks/useAppRoutes';

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

  const hasCustomActions =
    code === OUTCOMES['pagamento-non-riuscito'] || code === OUTCOMES['pagamento-annullato'];

  return (
    <Container
      maxWidth="sm"
      id="courtesyPage"
      sx={{
        display: 'flex',
        alignItems: 'center',
        minHeight: '70vh',
        justifyContent: 'center',
        paddingBottom: 15
      }}>
      <Box textAlign="center" mt={10} mb={10}>
        <Box my={3}>
          <ErrorIconComponent code={code} />
        </Box>
        <Typography variant="h4" gutterBottom data-testid="courtesyPage.title">
          {t(`courtesyPage.${code}.title`, {
            defaultValue: t('courtesyPage.default.title')
          })}
        </Typography>
        <Typography variant="body1" paragraph data-testid="courtesyPage.body">
          {t(`courtesyPage.${code}.body`, {
            defaultValue: t('courtesyPage.default.body')
          })}
        </Typography>

        {hasCustomActions ? (
          <CourtesyPageActions code={code} />
        ) : (
          i18next.exists(`courtesyPage.${code}.cta`) && (
            <Button
              component={Link}
              to={routes.LOGIN}
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
