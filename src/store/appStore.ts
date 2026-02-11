import { signal } from '@preact/signals-react';
import { BrokerInfoDTO } from '../../generated/data-contracts';

type AppStore = {
  isReady: boolean;
  brokerInfo: BrokerInfoDTO | null;
};

const defaultAppStore: AppStore = { isReady: false, brokerInfo: null };

const appStore = signal(defaultAppStore);

export function setBrokerInfo(info: BrokerInfoDTO) {
  appStore.value = { ...appStore.value, brokerInfo: info };
  setAppReady();
}

export function resetAppStore() {
  appStore.value = defaultAppStore;
}

export function setAppReady() {
  appStore.value = { ...appStore.value, isReady: true };
}

export default appStore;
