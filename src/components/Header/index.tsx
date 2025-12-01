import React from 'react';
import { HeaderAccount, JwtUser, RootLinkType, UserAction } from '@pagopa/mui-italia';
import utils from 'utils';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { useNavigate } from 'react-router-dom';
import { ArcRoutes } from 'routes/routes';
import { useUserInfo } from 'hooks/useUserInfo';
import { SubHeader } from './SubHeader';
import { useTranslation } from 'react-i18next';
import { Box } from '@mui/material';

export interface HeaderProps {
  onAssistanceClick?: () => void;
}

export const Header = (props: HeaderProps) => {
  /* istanbul ignore next */
  const { onAssistanceClick = () => null } = props;
  const navigate = useNavigate();
  const { t } = useTranslation();
  const brokerId = utils.storage.app.getBrokerId();

  async function logoutUser() {
    try {
      await utils.apiClient.logout.getLogoutEndpoint();
    } catch (e) {
      console.warn(e);
    } finally {
      utils.storage.user.logOut();
      navigate(ArcRoutes.LOGIN);
    }
  }

  const { userInfo } = useUserInfo();
  const { data: brokerInfo } = utils.loaders.public.useBrokerInfo(brokerId);

  const rootLink: RootLinkType = {
    label: brokerInfo?.brokerName ?? '',
    href: ArcRoutes.DASHBOARD,
    ariaLabel: brokerInfo?.brokerName ?? '',
    title: brokerInfo?.brokerName ?? ''
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
        navigate(ArcRoutes.USER);
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

  const Product = () => (
    <Box>
      {brokerInfo?.brokerLogo ? (
        <img src={brokerInfo?.brokerLogo ?? ''} alt={`${brokerInfo?.brokerName} logo`} width="56" />
      ) : null}
    </Box>
  );

  return (
    <>
      <HeaderAccount
        rootLink={rootLink}
        enableDropdown
        onAssistanceClick={onAssistanceClick}
        loggedUser={jwtUser}
        userActions={userActions}
        translationsMap={{ assistance: t('ui.header.help') }}
      />
      <SubHeader product={<Product />} />
    </>
  );
};
