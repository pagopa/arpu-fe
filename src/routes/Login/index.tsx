import { useEffect } from 'react';
import utils from 'utils';
import { ROUTES } from 'routes/routes';
import { Button, Card, Stack, Typography, useTheme } from '@mui/material';
import React from 'react';
import PermIdentityOutlinedIcon from '@mui/icons-material/PermIdentityOutlined';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const theme = useTheme();
  const { t } = useTranslation();

  const navigate = useNavigate();

  const logIn = () => {
    // Pin the broker (read from the URL) into localStorage before leaving for
    // OneIdentity. The IdP redirects back to /auth-callback, a URL with no
    // broker segment, where the broker can only be resolved from localStorage.
    // The URL is the source of truth, overriding any stale stored value.
    const brokerCode = utils.storage.app.getBrokerCode();
    if (brokerCode) utils.storage.app.setBrokerCode(brokerCode);
    window.location.replace(utils.config.loginUrl);
  };

  useEffect(() => {
    if (utils.storage.user.hasToken()) navigate(ROUTES.DASHBOARD);
  }, []);

  const handleCTA1 = () => navigate(ROUTES.public.PAYMENTS_ON_THE_FLY);
  const handleCTA2 = () => navigate(ROUTES.public.RECEIPTS_SEARCH);
  const handleCTA3 = () => navigate(ROUTES.public.DEBT_POSITION_SEARCH);

  return (
    <Stack direction={{ xs: 'column', lg: 'row' }}>
      <Stack
        alignItems="center"
        bgcolor={theme.palette.background.default}
        py={{ xs: 11, md: 16 }}
        px={3}
        width={{ xs: '100%', lg: '60%' }}>
        <Stack gap={4} alignItems="center" width={{ xs: '100%', md: 394 }}>
          <Stack gap={1}>
            <Typography variant="h3" textAlign="center">
              {t('app.login.auth.title')}
            </Typography>
            <Typography variant="body1" textAlign="center">
              {t('app.login.auth.description')}
            </Typography>
          </Stack>
          <Card elevation={16} sx={{ borderRadius: 2, alignItems: 'center', p: 3, width: '272px' }}>
            <Button
              fullWidth
              data-testid="logInButton"
              variant="contained"
              size="large"
              startIcon={<PermIdentityOutlinedIcon />}
              onClick={logIn}>
              {t('app.login.auth.CTA')}
            </Button>
          </Card>
        </Stack>
      </Stack>

      <Stack
        bgcolor={theme.palette.primary.main}
        gap={4}
        py={{ xs: 11, md: 16 }}
        px={{ xs: 4, md: 8 }}
        width={{ xs: '100%', lg: '40%' }}>
        <Stack gap={2}>
          <Typography variant="h3" color={theme.palette.primary.contrastText}>
            {t('app.login.noAuth.title')}
          </Typography>
          <Typography variant="body1" color={theme.palette.primary.contrastText}>
            {t('app.login.noAuth.description')}
          </Typography>
        </Stack>
        <Stack gap={2.5} width={{ xs: '100%', sm: '40%', lg: '85%', xl: '60%' }}>
          <Button variant="contrast" size="large" onClick={handleCTA1} data-testid="loginPage-cta1">
            {t('app.login.noAuth.CTA1')}
          </Button>
          <Button variant="contrast" size="large" onClick={handleCTA2} data-testid="loginPage-cta2">
            {t('app.login.noAuth.CTA2')}
          </Button>
          <Button variant="contrast" size="large" onClick={handleCTA3} data-testid="loginPage-cta3">
            {t('app.login.noAuth.CTA3')}
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default Login;
