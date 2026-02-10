import { signal } from '@preact/signals-react';

export const appReady = signal(false);

export function setAppReady() {
  appReady.value = true;
}

export function resetBrokerInfo() {
  appReady.value = false;
}
