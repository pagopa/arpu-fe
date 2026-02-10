import utils from '.';
import config from './config';
import { ArcErrors, ArcRoutes } from 'routes/routes';
import { setBrokerInfo, brokerInfoState } from 'store/BrokerStore';

/** Initial setup function to prepare the application state and necessary config */
const stateSetup = async () => {
  const { data } = await utils.apiClient.public.getPublicBrokerInfo(config.brokerId);
  setBrokerInfo(data);
};

const setupOrError = async () => {
  try {
    await stateSetup();
  } catch {
    window.location.replace(`${ArcRoutes.COURTESY_PAGE.replace(':error', ArcErrors['404'])}`);
  }
};

const appSetup = async () => {
  await setupOrError();
  return true;
};

const isAppReady = () =>
  Boolean(brokerInfoState.value.brokerName) && Boolean(brokerInfoState.value.brokerFiscalCode);

export { setupOrError, isAppReady, appSetup };
