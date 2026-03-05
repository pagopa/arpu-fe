import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from 'hooks/useLanguage';
import { Divider, Link, Stack, Typography } from '@mui/material';
import { ROUTES } from 'routes/routes';
import { ProductLogo } from './ProductLogo';
import appStore from 'store/appStore';
import { LangSwitch } from '@pagopa/mui-italia';
import { languages } from 'translations/languages';

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
  const { language, changeLanguage } = useLanguage();

  const { brokerInfo } = appStore.value;

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
        <Stack alignItems="flex-end">
          <Stack direction="row" gap={2} alignItems="center" component="nav">
            <FooterLink href={ROUTES.PRIVACY_POLICY}>{t('ui.footer.privacy')}</FooterLink>
            <FooterLink href={ROUTES.TOS}>{t('ui.footer.termsAndConditions')}</FooterLink>
            <FooterLink href={LINK_A11Y}>{t('ui.footer.a11y')}</FooterLink>
            <FooterLink href="#">{t('ui.footer.personalData')}</FooterLink>
            <LangSwitch
              currentLangCode={language}
              onLanguageChanged={changeLanguage}
              languages={languages}
            />
          </Stack>
        </Stack>
      </Stack>
      {brokerInfo?.brokerName ? (
        <Stack>
          <Divider />
          <Stack alignItems="center" justifyContent="center" height={60}>
            <Typography component="span" fontWeight={600} fontSize={14}>
              {brokerInfo.brokerName}
            </Typography>
          </Stack>
        </Stack>
      ) : null}
    </Stack>
  );
};
