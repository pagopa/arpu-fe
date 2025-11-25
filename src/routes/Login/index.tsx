import { useEffect } from 'react';
import utils from 'utils';
import { ArcRoutes } from 'routes/routes';
import {
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Stack,
  Typography,
  useTheme
} from '@mui/material';
import React from 'react';
import PermIdentityOutlinedIcon from '@mui/icons-material/PermIdentityOutlined';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const theme = useTheme();
  const { t } = useTranslation();

  const logIn = () => window.location.replace(utils.config.loginUrl);

  useEffect(() => {
    if (utils.storage.user.hasToken()) window.location.replace(ArcRoutes.DASHBOARD);
  }, []);

  const navigate = useNavigate();

  const handleCTA1 = () => navigate(ArcRoutes.public.PAYMENTS_ON_THE_FLY);

  return (
    <Grid container minHeight={580}>
      <Grid size={{ xs: 12, md: 8 }} bgcolor={theme.palette.background.default} pt={16} pb={16}>
        <Container>
          <Stack alignItems="center">
            <Stack width={394} alignItems={'center'} gap={1}>
              <Typography variant="h3" textAlign="center">
                {t('app.login.auth.title')}
              </Typography>
              <Typography variant="body1" textAlign="center" mb={4}>
                {t('app.login.auth.description')}
              </Typography>
              <Card elevation={16}>
                <CardContent>
                  <Button
                    data-testid="logInButton"
                    variant="contained"
                    size="large"
                    startIcon={<PermIdentityOutlinedIcon />}
                    onClick={logIn}>
                    {t('app.login.auth.CTA')}
                  </Button>
                </CardContent>
              </Card>
            </Stack>
          </Stack>
        </Container>
      </Grid>

      <Grid size={{ xs: 12, md: 4 }} bgcolor={theme.palette.primary.main} pt={16} pb={16}>
        <Container>
          <Stack alignItems="center">
            <Stack width={336} gap={1}>
              <Typography variant="h3" color={theme.palette.primary.contrastText}>
                {t('app.login.noAuth.title')}
              </Typography>
              <Typography variant="body1" mb={4} color={theme.palette.primary.contrastText}>
                {t('app.login.noAuth.description')}
              </Typography>
              <Card elevation={16}>
                <CardContent>
                  <Stack gap={2}>
                    <Button variant="contained" size="large" color="primary" onClick={handleCTA1}>
                      {t('app.login.noAuth.CTA1')}
                    </Button>
                    <Button variant="contained" size="large">
                      {t('app.login.noAuth.CTA2')}
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Stack>
        </Container>
      </Grid>
    </Grid>
  );
};

export default Login;
