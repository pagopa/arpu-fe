import { signal } from '@preact/signals-react';

export enum SessionItems {
  CART = 'CART',
  OPTIN = 'OPTIN'
}

/** set a session item and return his value. If not possible returs null */
const setSessionItem = (key: SessionItems, value: string) => {
  try {
    sessionStorage.setItem(key, value);
    return value;
  } catch {
    return null;
  }
};

/** get a session item and return his value. If not possible returns null */
const getSessionItem = (key: SessionItems) => sessionStorage.getItem(key);

enum StorageItems {
  TOKEN = 'ARPU-accessToken',
  BROKERID = 'ARPU-brokerId'
}

/** set a session item and return his value. If not possible returs null */
const setStorageItem = (key: StorageItems, value: string) => {
  try {
    localStorage.setItem(key, value);
    return value;
  } catch {
    return null;
  }
};

/** get a session item and return his value. If not possible returns null */
const getStorageItem = (key: StorageItems) => localStorage.getItem(key);

/** clear both session and local storage */
const clear = () => {
  window.sessionStorage.clear();
  window.localStorage.clear();
};

const optin = signal<boolean>(Boolean(getSessionItem(SessionItems.OPTIN)));

/** check if the user is anonymous */
const isAnonymous = () => {
  const hasToken = Boolean(getStorageItem(StorageItems.TOKEN));
  const isOnPublicRoute = window.location.href.indexOf('/public') > 0;
  return !hasToken && isOnPublicRoute;
};

export default {
  SessionItems,
  StorageItems,
  pullPaymentsOptIn: {
    set: () => {
      if (setSessionItem(SessionItems.OPTIN, 'true')) optin.value = true;
      return optin.value;
    },
    /** return a signal */
    get: () => {
      getSessionItem(SessionItems.OPTIN);
      return optin;
    },
    clear: () => {
      if (setSessionItem(SessionItems.OPTIN, 'false')) optin.value = false;
    }
  },
  user: {
    hasToken: () => Boolean(getStorageItem(StorageItems.TOKEN)),
    isAnonymous,
    /** clear both session and local storage */
    logOut: clear,
    setToken: (token: string) => setStorageItem(StorageItems.TOKEN, token)
  },
  app: {
    setBrokerId: (brokerId: string | number) =>
      setStorageItem(StorageItems.BROKERID, brokerId.toString()),
    /** this check is necessaty because we land on the auth-callaback page without a brokerId in the URL */
    getBrokerId: () =>
      window.location.pathname.split('/')[2] === 'auth-callback'
        ? Number(getStorageItem(StorageItems.BROKERID)) || -1
        : Number(window.location.pathname.split('/')[2]) || -1
  }
};
