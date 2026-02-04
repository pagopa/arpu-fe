import { signal } from '@preact/signals-react';
import { AppState } from '../models/AppState';

export const appState = signal<AppState>({
  loading: false,
  ready: false
});

export function setAppState(newState: Partial<AppState>) {
  appState.value = { ...appState.value, ...newState };
}

export function setLoading(newState: AppState['loading']) {
  appState.value.loading = newState;
}
