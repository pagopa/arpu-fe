import utils from '.';
import config from './config';
import { ArcErrors, ArcRoutes } from 'routes/routes';
import { setAppReady, setBrokerInfo } from 'store/appStore';

/** Initial setup function to prepare the application state and necessary config */
const stateSetup = async () => {
  const brokerId = Number(config.brokerId);
  const { data } = await utils.apiClient.public.getPublicBrokerInfo(brokerId);
  setBrokerInfo(data);
};

const setupOrError = async () => {
  try {
    if (!window.location.href.includes(ArcErrors[410])) {
      await stateSetup();
      return true;
    }
    return false;
  } catch {
    const toUrl = ArcRoutes.COURTESY_PAGE.replace(':error', ArcErrors[410]);
    window.location.replace(toUrl);
    return false;
  } finally {
    setAppReady();
  }
};

const appSetup = async () => await setupOrError();

export { appSetup };
