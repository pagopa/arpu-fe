import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from 'hooks/useLanguage';
import { Divider, Link, Stack, Typography } from '@mui/material';
import { ArcRoutes } from 'routes/routes';
import { ProductLogo } from './ProductLogo';
import { brokerInfoState } from 'store/BrokerStore';

const LINK_PERSONAL_DATA_PROTECTION =
  'https://privacyportal-de.onetrust.com/webform/77f17844-04c3-4969-a11d-462ee77acbe1/9ab6533d-be4a-482e-929a-0d8d2ab29df8';

const LINK_A11Y = 'https://www.w3.org/WAI/standards-guidelines/wai-aria/';

const FooterLink = ({ href, children }: { href: string; children: string }) => {
  return (
    <Link
      href={href}
      variant="body2"
      target="_blank"
      rel="noopener noreferrer"
      sx={{ textDecoration: 'none', color: 'text.primary', fontWeight: 600, fontSize: 14 }}>
      {children}
    </Link>
  );
};

export const Footer = () => {
  const { t } = useTranslation();
  useLanguage();

  return (
    <Stack
      component="footer"
      sx={{
        backgroundColor: 'background.paper'
      }}>
      <Divider />
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        padding={3}
        minHeight={50}>
        <ProductLogo />
        <Stack direction="row" gap={2} alignItems="center" component="nav">
          <FooterLink href={ArcRoutes.PRIVACY_POLICY}>{t('ui.footer.privacy')}</FooterLink>
          <FooterLink href={ArcRoutes.TOS}>{t('ui.footer.termsAndConditions')}</FooterLink>
          <FooterLink href={LINK_A11Y}>{t('ui.footer.a11y')}</FooterLink>
          <FooterLink href={LINK_PERSONAL_DATA_PROTECTION}>
            {t('ui.footer.personalData')}
          </FooterLink>
        </Stack>
      </Stack>
      <Stack>
        <Divider />
        <Stack alignItems="center" justifyContent="center" height={60}>
          <Typography component="span" fontWeight={600} fontSize={14}>
            {brokerInfoState.value.brokerName}
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  );
};
