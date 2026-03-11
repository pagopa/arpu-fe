import storage from './storage';

describe('storage', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('user.logot should clear sessionStorage and localStorage', () => {
    // Mock the sessionStorage and localStorage
    const storageSpy = vi.spyOn(Storage.prototype, 'clear');

    storage.user.logOut();

    // Assert that the clear methods were called
    expect(storageSpy).toHaveBeenCalled();
  });

  it('user.setToken and user.getToken and should set and get the accessToken item', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem');

    expect(storage.user.hasToken()).not.toBeTruthy();
    const token = storage.user.setToken('testToken');
    expect(setItemSpy).toHaveBeenCalled();
    expect(token).toBe('testToken');
    expect(storage.user.hasToken()).toBeTruthy();
    expect(getItemSpy).toHaveBeenCalled();
  });

  it('pullPaymentsOptIn should set, get and clear optin status', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem');

    // Test set
    const optinSet = storage.pullPaymentsOptIn.set();
    expect(setItemSpy).toHaveBeenCalledWith(storage.SessionItems.OPTIN, 'true');
    expect(optinSet).toBe(true);

    // Test get
    const optinSignal = storage.pullPaymentsOptIn.get();
    expect(optinSignal.value).toBe(true);
    expect(getItemSpy).toHaveBeenCalledWith(storage.SessionItems.OPTIN);

    // Test clear
    storage.pullPaymentsOptIn.clear();
    expect(setItemSpy).toHaveBeenCalledWith(storage.SessionItems.OPTIN, 'false');
    expect(storage.pullPaymentsOptIn.get().value).toBe(false);
  });

  it('user.isAnonymous should correctly identify anonymous state based on token and URL', () => {
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem');

    // Mock window.location
    const originalLocation = window.location;
    // Use defineProperty to safely mock window.location
    Object.defineProperty(window, 'location', {
      value: { ...originalLocation, href: 'http://localhost/public/test' },
      writable: true
    });

    // Public route, no token
    getItemSpy.mockReturnValue(null);
    expect(storage.user.isAnonymous()).toBe(true);

    // Public route, with token
    getItemSpy.mockImplementation((key) => {
      if (key === storage.StorageItems.TOKEN) return 'token';
      return null;
    });
    expect(storage.user.isAnonymous()).toBe(false);

    // Private route, no token
    window.location.href = 'http://localhost/private/test';
    getItemSpy.mockReturnValue(null);
    expect(storage.user.isAnonymous()).toBe(false);

    // Restore original location
    Object.defineProperty(window, 'location', { value: originalLocation });
  });

  it('app.setBrokerId and getBrokerId should read from localStorage', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem');

    storage.app.setBrokerId(12345);
    expect(setItemSpy).toHaveBeenCalledWith(storage.StorageItems.BROKERID, '12345');

    getItemSpy.mockImplementation((key) => {
      if (key === storage.StorageItems.BROKERID) return '12345';
      return null;
    });
    expect(storage.app.getBrokerId()).toBe(12345);

    getItemSpy.mockReturnValue(null);
    expect(storage.app.getBrokerId()).toBeNull();
  });

  it('app.getBrokerCode should extract brokerCode from URL and normalize to lowercase', () => {
    const originalLocation = window.location;

    Object.defineProperty(window, 'location', {
      value: { ...originalLocation, pathname: '/cittadini/CIE/dashboard' },
      writable: true
    });
    expect(storage.app.getBrokerCode()).toBe('cie');

    window.location.pathname = '/cittadini/RomaCentro/accesso';
    expect(storage.app.getBrokerCode()).toBe('romacentro');

    window.location.pathname = '/cittadini/cie/dashboard';
    expect(storage.app.getBrokerCode()).toBe('cie');

    Object.defineProperty(window, 'location', { value: originalLocation });
  });

  it('app.getBrokerCode should fallback to localStorage on auth-callback page', () => {
    const originalLocation = window.location;
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem');

    Object.defineProperty(window, 'location', {
      value: { ...originalLocation, pathname: '/cittadini/auth-callback' },
      writable: true
    });

    getItemSpy.mockImplementation((key) => {
      if (key === storage.StorageItems.BROKERCODE) return 'cie';
      return null;
    });

    expect(storage.app.getBrokerCode()).toBe('cie');
    expect(getItemSpy).toHaveBeenCalledWith(storage.StorageItems.BROKERCODE);

    Object.defineProperty(window, 'location', { value: originalLocation });
  });

  it('app.setBrokerCode should persist to localStorage', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

    storage.app.setBrokerCode('cie');
    expect(setItemSpy).toHaveBeenCalledWith(storage.StorageItems.BROKERCODE, 'cie');
  });

  it('should handle storage errors gracefully', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage full');
    });

    const result = storage.user.setToken('test');
    expect(setItemSpy).toHaveBeenCalled();
    expect(result).toBeNull();
  });
});
