import { signal } from '@preact/signals-react';
import { BrokerInfoDTO } from '../../generated/data-contracts';
import storage from 'utils/storage';
import { BrokerConfig, defaultBrokerConfig } from 'utils/brokerconfig';

interface ParsedConfig extends Omit<BrokerInfoDTO, 'config'> {
  config?: BrokerConfig
}

type AppStore = {
  isReady: boolean;
  brokerInfo: ParsedConfig | null
  /** The broker's external identifier (human-readable), used in URLs */
  brokerCode: string | null;
};

const defaultAppStore: AppStore = { isReady: false, brokerInfo: null, brokerCode: null };

const appStore = signal(defaultAppStore);

/**
 * Stores the broker info and the broker code (externalId) in both
 * the reactive store and localStorage for persistence across sessions.
 */
export function setBrokerInfo(parsedConfig: ParsedConfig, brokerCode: string) {
  // Persist to localStorage
  storage.app.setBrokerId(String(parsedConfig.brokerId));
  storage.app.setBrokerCode(brokerCode);

  appStore.value = {
    ...appStore.value,
    brokerInfo: {
      ...appStore.value.brokerInfo,
      brokerId: parsedConfig.brokerId,
      brokerName: parsedConfig.brokerName,
      brokerFiscalCode: parsedConfig.brokerFiscalCode,
      brokerLogo: parsedConfig.brokerLogo,
      config: {
        ...appStore.value.brokerInfo?.config,
        translation: parsedConfig.config?.translation ?? defaultBrokerConfig.translation,
        useCart: parsedConfig.config?.useCart ?? defaultBrokerConfig.useCart,
      },
    },
    brokerCode
  };
  setAppReady();
}

export function resetAppStore() {
  appStore.value = defaultAppStore;
}

export function setAppReady() {
  appStore.value = { ...appStore.value, isReady: true };
}

export default appStore;
