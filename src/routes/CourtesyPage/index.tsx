import React from 'react';
import { Button, Typography, Container, Box } from '@mui/material';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArcErrors, ArpuOutcome, ArcRoutes } from '../../routes/routes';
import i18next from 'i18next';

type CourtesyCode = ArcErrors | ArpuOutcome;

interface ErrorIconComponentProps {
  code?: CourtesyCode;
}

export const ErrorIconComponent: React.FC<ErrorIconComponentProps> = ({ code }) => {
  switch (code) {
    case ArpuOutcome.PAGAMENTO_AVVISO_COMPLETATO:
      return <img src="/cittadini/pictograms/paymentcompleted.svg" title="OK" aria-hidden="true" />;
    case ArcErrors['accesso-non-autorizzato']:
    case ArcErrors['avviso-non-pagabile']:
      return <img src="/cittadini/pictograms/genericerror.svg" title="Error" aria-hidden="true" />;
    case ArcErrors['sessione-scaduta']:
      return <img src="/cittadini/pictograms/expired.svg" title="Expired" aria-hidden="true" />;
    case ArcErrors['avvio-pagamento']:
    case ArcErrors['sconosciuto']:
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
 * Resolves the URL param to a CourtesyCode:
 * - For outcome routes: returns the ArpuOutcome string value (used as i18n key)
 * - For error routes: returns the numeric ArcErrors value (used as i18n key)
 */
const resolveCode = (param?: string): CourtesyCode | undefined => {
  if (!param) return undefined;
  const outcomeValues = Object.values(ArpuOutcome) as string[];
  if (outcomeValues.includes(param)) return param as ArpuOutcome;
  const errorCode = ArcErrors[param as keyof typeof ArcErrors];
  return errorCode !== undefined ? errorCode : undefined;
};

export const CourtesyPage = () => {
  const { t } = useTranslation();
  const params = useParams();
  const param = params?.error ?? params?.outcome;
  const code = resolveCode(param);

  return (
    <>
      <Container maxWidth="sm">
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
          {/* v8 ignore next 12 */}
          {i18next.exists(`courtesyPage.${code}.cta`) && (
            <Button
              component={Link}
              to={ArcRoutes.LOGIN}
              variant="contained"
              size="large"
              color="primary"
              data-testid="courtesyPage.cta">
              {t(`courtesyPage.${code}.cta`, {
                defaultValue: t('courtesyPage.default.cta')
              })}
            </Button>
          )}
        </Box>
      </Container>
    </>
  );
};
