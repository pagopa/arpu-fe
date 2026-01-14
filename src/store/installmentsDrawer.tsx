import { signal } from '@preact/signals-react';
import { InstallmentsDrawerState } from 'models/InstallmentDrawer';

const defaultInstallmentsDrawerState: InstallmentsDrawerState = {
  isOpen: false,
  items: []
};

export const installmentsDrawerState = signal<InstallmentsDrawerState>(
  defaultInstallmentsDrawerState
);

export function setInstallmentsDrawerState(items: InstallmentsDrawerState['items']) {
  installmentsDrawerState.value.items = items;
}

export function resetInstallmentsDrawer() {
  installmentsDrawerState.value = defaultInstallmentsDrawerState;
}

export function toggleInstallmentsDrawer() {
  installmentsDrawerState.value = {
    ...installmentsDrawerState.value,
    isOpen: !installmentsDrawerState.value.isOpen
  };
}

export function openInstallmentsDrawer(items?: InstallmentsDrawerState['items']) {
  if (items) {
    installmentsDrawerState.value.items = items;
  }
  installmentsDrawerState.value = { ...installmentsDrawerState.value, isOpen: true };
}

export function closeInstallmentsDrawer() {
  installmentsDrawerState.value = { ...installmentsDrawerState.value, isOpen: false };
}
