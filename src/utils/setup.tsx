import utils from '.';
import config from './config';
import { ArcErrors, ArcRoutes } from 'routes/routes';
import { setBrokerInfo } from 'store/BrokerStore';
import { setAppReady } from 'store/appStore';

/** Initial setup function to prepare the application state and necessary config */
const stateSetup = async () => {
  const brokerId = Number(config.brokerId);
  const { data } = await utils.apiClient.public.getPublicBrokerInfo(brokerId);
  setBrokerInfo(data);
  setAppReady();
};

const setupOrError = async () => {
  try {
    if (!window.location.href.includes(ArcErrors[410])) {
      await stateSetup();
    }
  } catch {
    const toUrl = ArcRoutes.COURTESY_PAGE.replace(':error', ArcErrors[410]);
    window.location.replace(toUrl);
  } finally {
    setAppReady();
  }
};

const appSetup = async () => {
  await setupOrError();
  return true;
};

export { setupOrError, appSetup };
