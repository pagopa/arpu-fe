export enum SessionItems {
  CART = 'CART'
}

enum StorageItems {
  TOKEN = 'accessToken',
  BROKERID = 'brokerId'
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

/** check if the user is anonymous */
const isAnonymous = () => {
  const hasToken = Boolean(getStorageItem(StorageItems.TOKEN));
  const isOnPublicRoute = window.location.href.indexOf('/public') > 0;
  return !hasToken && isOnPublicRoute;
};

export default {
  SessionItems,
  StorageItems,
  user: {
    hasToken: () => Boolean(getStorageItem(StorageItems.TOKEN)),
    isAnonymous,
    /** clear both session and local storage */
    logOut: clear,
    setToken: (token: string) => setStorageItem(StorageItems.TOKEN, token)
  },
  app: {
    setBrokerId: (brokerId: string) => setStorageItem(StorageItems.BROKERID, brokerId),
    getBrokerId: () => Number(getStorageItem(StorageItems.BROKERID)) || -1
  }
};
