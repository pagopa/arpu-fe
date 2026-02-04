import { describe, it, expect } from 'vitest';
import { AppState } from '../models/AppState';
import { appState, setAppState, setLoading } from './AppStateStore';

describe('AppState Store', () => {
  it('should initialize appState with the default value', () => {
    expect(appState.value).toEqual({
      loading: false,
      ready: false
    });
  });

  it('setAppState should update the appState to the provided new state', () => {
    const newState: AppState = {
      loading: true,
      ready: false
    };
    setAppState(newState);

    expect(appState.value).toEqual(newState);
  });

  it('setLoading should update only the loading property in appState', () => {
    const initialState: AppState = {
      loading: false,
      ready: false
    };
    appState.value = initialState; // Reset the state for this test

    setLoading(true);

    expect(appState.value).toEqual({
      loading: true,
      ready: false
    });
  });
});
