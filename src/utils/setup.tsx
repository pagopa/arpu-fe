import utils from '.';
import { applyBrokerTranslations, parseBrokerConfig } from './brokerconfig';
import config from './config';
import { OUTCOMES, ROUTES } from 'routes/routes';
import { setAppReady, setBrokerInfo } from 'store/appStore';

/**
 * Initial setup function to prepare the application state and necessary config.
 *
 * The broker is now identified by brokerCode (externalId) extracted from the URL,
 * and the API resolves it to the numeric brokerId via query parameter.
 */
const stateSetup = async () => {
  const brokerCode = config.brokerCode;

  if (!brokerCode) {
    throw new Error('Broker code not found in URL');
  }

  // Call the broker info API using the externalId (brokerCode) query param
  const { data } = await utils.apiClient.public.getPublicBrokerInfo({ externalId: brokerCode });

  // Parse and validate the broker config
  const brokerConfig = parseBrokerConfig(data?.config);

  // apply translations if present
  applyBrokerTranslations(brokerConfig.translation);

  // Persist both brokerCode and the resolved brokerId
  setBrokerInfo({ ...data, config: brokerConfig }, brokerCode);
};

const setupOrError = async () => {
  try {
    if (!window.location.href.includes(OUTCOMES[410])) {
      await stateSetup();
      return true;
    }
    return false;
  } catch {
    const toUrl = ROUTES.COURTESY_PAGE.replace(':outcome', OUTCOMES[410]);
    window.location.replace(toUrl);
    return false;
  } finally {
    setAppReady();
  }
};

const appSetup = async () => await setupOrError();

export { appSetup };
