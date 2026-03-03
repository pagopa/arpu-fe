import { signal } from '@preact/signals-react';
import { BrokerInfoDTO } from '../../generated/data-contracts';
import storage from 'utils/storage';

type AppStore = {
  isReady: boolean;
  brokerInfo: BrokerInfoDTO | null;
  /** The broker's external identifier (human-readable), used in URLs */
  brokerCode: string | null;
};

const defaultAppStore: AppStore = { isReady: false, brokerInfo: null, brokerCode: null };

const appStore = signal(defaultAppStore);

/**
 * Stores the broker info and the broker code (externalId) in both
 * the reactive store and localStorage for persistence across sessions.
 */
export function setBrokerInfo(info: BrokerInfoDTO, brokerCode: string) {
  // Persist to localStorage
  storage.app.setBrokerId(String(info.brokerId));
  storage.app.setBrokerCode(brokerCode);

  appStore.value = {
    ...appStore.value,
    brokerInfo: info,
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
