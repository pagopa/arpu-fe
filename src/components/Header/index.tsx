import React from 'react';
import { HeaderAccount, JwtUser, RootLinkType, UserAction } from '@pagopa/mui-italia';
import utils from 'utils';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from 'routes/routes';
import { useUserInfo } from 'hooks/useUserInfo';
import { useTranslation } from 'react-i18next';
import { Box } from '@mui/system';
import appStore from 'store/appStore';

export interface HeaderProps {
  onAssistanceClick?: () => void;
}

export const Header = (props: HeaderProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const assistanceLink = appStore.value.brokerInfo?.config?.assistanceLink;

  const onAssistanceClick =
    props.onAssistanceClick ??
    (assistanceLink ? () => window.open(assistanceLink, '_blank') : () => undefined);

  async function logoutUser() {
    try {
      await utils.apiClient.logout.getLogoutEndpoint();
    } catch (e) {
      console.warn(e);
    } finally {
      utils.storage.user.logOut();
      navigate(ROUTES.LOGIN);
    }
  }

  const { userInfo } = useUserInfo();

  const rootLink: RootLinkType = {
    label: appStore.value.brokerInfo?.brokerName || '',
    href: ROUTES.DASHBOARD,
    ariaLabel: appStore.value.brokerInfo?.brokerName || '',
    title: appStore.value.brokerInfo?.brokerName || ''
  };

  const jwtUser: JwtUser | undefined = userInfo
    ? {
        id: userInfo?.userId,
        name: utils.converters.capitalizeFirstLetter(userInfo?.name),
        surname: utils.converters.capitalizeFirstLetter(userInfo?.familyName),
        email: ''
      }
    : undefined;

  const userActions: UserAction[] = [
    {
      id: 'profile',
      label: t('ui.header.profile'),
      onClick: () => {
        navigate(ROUTES.USER);
      },
      icon: <SettingsIcon fontSize="small" color="inherit" />
    },
    {
      id: 'logout',
      label: t('ui.header.logout'),
      onClick: logoutUser,
      icon: <LogoutRoundedIcon fontSize="small" color="inherit" />
    }
  ];

  return (
    <>
      <Box component="header">
        <HeaderAccount
          rootLink={rootLink}
          enableDropdown
          onAssistanceClick={onAssistanceClick}
          loggedUser={jwtUser}
          userActions={userActions}
          translationsMap={{ assistance: t('ui.header.help') }}
        />
      </Box>
    </>
  );
};
