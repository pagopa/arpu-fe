import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from 'hooks/useLanguage';
import { Divider, Link, Stack, Typography } from '@mui/material';
import { ROUTES } from 'routes/routes';
import { ProductLogo } from './ProductLogo';
import appStore from 'store/appStore';
import { LangSwitch } from '@pagopa/mui-italia';
import { languages } from 'translations/languages';

const DEFAULT_LINK_A11Y = 'https://www.w3.org/WAI/standards-guidelines/wai-aria/';

const FooterLink = ({ href, children }: { href: string; children: string }) => {
  return (
    <Stack component="li" sx={{ listStyle: 'none' }}>
      <Link
        href={href}
        variant="body2"
        target="_blank"
        rel="noopener noreferrer"
        sx={{ textDecoration: 'none', color: 'text.primary', fontWeight: 600, fontSize: 14 }}>
        {children}
      </Link>
    </Stack>
  );
};

export const Footer = () => {
  const { t } = useTranslation();
  const { language, changeLanguage } = useLanguage();

  const { brokerInfo } = appStore.value;
  const a11yLink = brokerInfo?.config?.a11yLink ?? DEFAULT_LINK_A11Y;

  return (
    <Stack
      component="footer"
      sx={{
        backgroundColor: 'background.paper'
      }}>
      <Divider />

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems="center"
        gap={{ xs: 3, md: 0 }}
        padding={3}
        minHeight={50}>
        <ProductLogo maxWidth="80px" />
        <Stack alignItems="flex-end" component="nav">
          <Stack
            sx={{ padding: 0 }}
            direction={{ xs: 'column', md: 'row' }}
            gap={{ xs: 0, md: 2 }}
            alignItems="center"
            component="ul"
            id="footer-links">
            <FooterLink href={ROUTES.PRIVACY_POLICY}>{t('ui.footer.privacy')}</FooterLink>
            <FooterLink href={ROUTES.TOS}>{t('ui.footer.termsAndConditions')}</FooterLink>
            <FooterLink href={a11yLink}>{t('ui.footer.a11y')}</FooterLink>
            <Stack component={'li'} sx={{ listStyle: 'none' }} id="lang-switch">
              <LangSwitch
                currentLangCode={language}
                onLanguageChanged={changeLanguage}
                languages={languages}
              />
            </Stack>
          </Stack>
        </Stack>
      </Stack>
      {brokerInfo?.brokerName ? (
        <>
          <Divider />
          <Stack px={3}>
            <Stack alignItems="center" direction={'row'} justifyContent="center" height={60}>
              <Typography fontSize={14} textAlign="center">
                <span style={{ fontWeight: 600 }}>{brokerInfo.brokerName}</span>
                {brokerInfo.address &&
                  ` – ${brokerInfo.address} · ${brokerInfo.zipCode} ${brokerInfo.city}`}
              </Typography>
            </Stack>
          </Stack>
        </>
      ) : null}
    </Stack>
  );
};
