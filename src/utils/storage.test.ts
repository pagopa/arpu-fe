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

  it('app.setBrokerId and getBrokerId should work correctly', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem');

    const brokerId = '12345';
    storage.app.setBrokerId(brokerId);
    expect(setItemSpy).toHaveBeenCalledWith(storage.StorageItems.BROKERID, brokerId);

    // Mock window.location.pathname
    const originalLocation = window.location;
    Object.defineProperty(window, 'location', {
      value: { ...originalLocation, pathname: '/somepath/67890' },
      writable: true
    });

    // Case 1: brokerId from URL
    expect(storage.app.getBrokerCode()).toBe('67890');

    // Case 2: brokerId from storage when on auth-callback
    window.location.pathname = '/something/auth-callback';
    getItemSpy.mockImplementation((key) => {
      if (key === storage.StorageItems.TOKEN) return 'token';
      if (key === storage.StorageItems.BROKERID) return brokerId;
      return null;
    });
    expect(storage.app.getBrokerId()).toBe(12345);

    Object.defineProperty(window, 'location', { value: originalLocation });
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
