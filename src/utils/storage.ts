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

export enum StorageItems {
  TOKEN = 'ARPU-accessToken',
  BROKERID = 'ARPU-brokerId',
  BROKERCODE = 'ARPU-brokerCode'
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

/** remove a storage item and swallow storage access errors */
const removeStorageItem = (key: StorageItems) => {
  try {
    localStorage.removeItem(key);
  } catch {
    return null;
  }
};

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

const getBrokerCodeFromUrl = (): string | null => {
  const segments = window.location.pathname.split('/');
  const isAuthCallback = segments[2] === 'auth-callback';

  if (isAuthCallback) {
    return getStorageItem(StorageItems.BROKERCODE);
  }

  return segments[2]?.toLowerCase() || null;
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
    getBrokerId: () => {
      const stored = getStorageItem(StorageItems.BROKERID);
      return stored ? Number(stored) : null;
    },
    setBrokerCode: (brokerCode: string) => setStorageItem(StorageItems.BROKERCODE, brokerCode),
    getBrokerCode: () => getBrokerCodeFromUrl(),
    clearBrokerInfo: () => {
      removeStorageItem(StorageItems.BROKERID);
      removeStorageItem(StorageItems.BROKERCODE);
    }
  }
};
