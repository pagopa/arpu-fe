/* eslint-disable @typescript-eslint/no-explicit-any */
import appStore, { setBrokerInfo, resetAppStore, setAppReady } from './appStore';
import storage from 'utils/storage';
import { defaultBrokerConfig } from 'utils/brokerconfig';

vi.mock('utils/storage', () => ({
  default: {
    app: {
      setBrokerId: vi.fn(),
      setBrokerCode: vi.fn()
    }
  }
}));

const baseParsedConfig = {
  brokerId: 1,
  externalId: 'ext-default',
  brokerName: 'Test Broker',
  brokerFiscalCode: '00000000000',
  config: { translation: {} }
};

describe('appStore', () => {
  afterEach(() => {
    resetAppStore();
    vi.clearAllMocks();
  });

  describe('default state', () => {
    it('should have isReady false by default', () => {
      expect(appStore.value.isReady).toBe(false);
    });

    it('should have brokerInfo null by default', () => {
      expect(appStore.value.brokerInfo).toBeNull();
    });

    it('should have brokerCode null by default', () => {
      expect(appStore.value.brokerCode).toBeNull();
    });
  });

  describe('setAppReady', () => {
    it('should set isReady to true', () => {
      setAppReady();

      expect(appStore.value.isReady).toBe(true);
    });

    it('should preserve existing state when setting ready', () => {
      setBrokerInfo(baseParsedConfig, 'broker-code');

      expect(appStore.value.isReady).toBe(true);
      expect(appStore.value.brokerCode).toBe('broker-code');
    });
  });

  describe('resetAppStore', () => {
    it('should reset to default state', () => {
      setBrokerInfo(baseParsedConfig, 'broker-code');

      resetAppStore();

      expect(appStore.value.isReady).toBe(false);
      expect(appStore.value.brokerInfo).toBeNull();
      expect(appStore.value.brokerCode).toBeNull();
    });
  });

  describe('setBrokerInfo', () => {
    it('should persist brokerId and brokerCode to localStorage', () => {
      setBrokerInfo({ ...baseParsedConfig, brokerId: 42 }, 'my-broker');

      expect(storage.app.setBrokerId).toHaveBeenCalledWith('42');
      expect(storage.app.setBrokerCode).toHaveBeenCalledWith('my-broker');
    });

    it('should set brokerCode in the store', () => {
      setBrokerInfo(baseParsedConfig, 'broker-abc');

      expect(appStore.value.brokerCode).toBe('broker-abc');
    });

    it('should set isReady to true', () => {
      setBrokerInfo(baseParsedConfig, 'broker-code');

      expect(appStore.value.isReady).toBe(true);
    });

    it('should store translation from config', () => {
      const translations = { it: { greeting: 'Ciao' } };

      setBrokerInfo({ ...baseParsedConfig, config: { translation: translations } }, 'broker-code');

      expect(appStore.value.brokerInfo?.config?.translation).toEqual(translations);
    });

    it('should fallback translation to default when config is undefined', () => {
      setBrokerInfo({ ...baseParsedConfig, config: undefined }, 'broker-code');

      expect(appStore.value.brokerInfo?.config?.translation).toEqual(
        defaultBrokerConfig.translation
      );
    });

    it('should store useCart from config', () => {
      setBrokerInfo(
        { ...baseParsedConfig, config: { translation: {}, useCart: false } },
        'broker-code'
      );

      expect(appStore.value.brokerInfo?.config?.useCart).toBe(false);
    });

    it('should fallback useCart to default when not provided', () => {
      setBrokerInfo(baseParsedConfig, 'broker-code');

      expect(appStore.value.brokerInfo?.config?.useCart).toBe(defaultBrokerConfig.useCart);
    });

    it('should store assistanceLink from config', () => {
      setBrokerInfo(
        {
          ...baseParsedConfig,
          config: { translation: {}, assistanceLink: 'https://help.example.com' }
        },
        'broker-code'
      );

      expect(appStore.value.brokerInfo?.config?.assistanceLink).toBe('https://help.example.com');
    });

    it('should leave assistanceLink undefined when not provided', () => {
      setBrokerInfo(baseParsedConfig, 'broker-code');

      expect(appStore.value.brokerInfo?.config?.assistanceLink).toBeUndefined();
    });

    it('should store a11yLink from config', () => {
      setBrokerInfo(
        {
          ...baseParsedConfig,
          config: { translation: {}, a11yLink: 'https://a11y.example.com' }
        },
        'broker-code'
      );

      expect(appStore.value.brokerInfo?.config?.a11yLink).toBe('https://a11y.example.com');
    });

    it('should store homeLink from config', () => {
      setBrokerInfo(
        {
          ...baseParsedConfig,
          config: { translation: {}, homeLink: 'https://home.example.com' }
        },
        'broker-code'
      );

      expect(appStore.value.brokerInfo?.config?.homeLink).toBe('https://home.example.com');
    });

    it('should leave homeLink undefined when not provided', () => {
      setBrokerInfo(baseParsedConfig, 'broker-code');

      expect(appStore.value.brokerInfo?.config?.homeLink).toBeUndefined();
    });

    it('should store brokerLink from config', () => {
      setBrokerInfo(
        {
          ...baseParsedConfig,
          config: { translation: {}, brokerLink: 'https://broker.example.com' }
        },
        'broker-code'
      );

      expect(appStore.value.brokerInfo?.config?.brokerLink).toBe('https://broker.example.com');
    });

    it('should leave brokerLink undefined when not provided', () => {
      setBrokerInfo(baseParsedConfig, 'broker-code');

      expect(appStore.value.brokerInfo?.config?.brokerLink).toBeUndefined();
    });

    it('should store downloadInfoLink from config', () => {
      setBrokerInfo(
        {
          ...baseParsedConfig,
          config: { translation: {}, downloadInfoLink: 'https://download.example.com/info' }
        },
        'broker-code'
      );

      expect(appStore.value.brokerInfo?.config?.downloadInfoLink).toBe(
        'https://download.example.com/info'
      );
    });

    it('should leave downloadInfoLink undefined when not provided', () => {
      setBrokerInfo(baseParsedConfig, 'broker-code');

      expect(appStore.value.brokerInfo?.config?.downloadInfoLink).toBeUndefined();
    });

    it('should store availableRoutes from config', () => {
      const routes = ['/dashboard', '/receipts'];

      setBrokerInfo(
        { ...baseParsedConfig, config: { translation: {}, availableRoutes: routes } },
        'broker-code'
      );

      expect(appStore.value.brokerInfo?.config?.availableRoutes).toEqual(routes);
    });

    it('should fallback availableRoutes to default when not provided', () => {
      setBrokerInfo(baseParsedConfig, 'broker-code');

      expect(appStore.value.brokerInfo?.config?.availableRoutes).toEqual(
        defaultBrokerConfig.availableRoutes
      );
    });

    it('should use externalId from parsedConfig when provided', () => {
      setBrokerInfo({ ...baseParsedConfig, externalId: 'ext-123' }, 'broker-code');

      expect(appStore.value.brokerInfo?.externalId).toBe('ext-123');
    });

    it('should fallback externalId to existing store value', () => {
      setBrokerInfo({ ...baseParsedConfig, externalId: 'ext-first' }, 'broker-code');

      setBrokerInfo({ ...baseParsedConfig, externalId: undefined } as any, 'broker-code-2');

      expect(appStore.value.brokerInfo?.externalId).toBe('ext-first');
    });

    it('should merge with existing brokerInfo preserving updated fields', () => {
      setBrokerInfo(
        {
          ...baseParsedConfig,
          brokerName: 'Broker One',
          config: { translation: {}, brokerLink: 'https://broker.example.com' }
        },
        'broker-code'
      );

      setBrokerInfo(
        {
          ...baseParsedConfig,
          brokerName: 'Broker Updated',
          config: { translation: {}, assistanceLink: 'https://help.example.com' }
        },
        'broker-code'
      );

      expect(appStore.value.brokerInfo?.brokerName).toBe('Broker Updated');
      expect(appStore.value.brokerInfo?.config?.assistanceLink).toBe('https://help.example.com');
      expect(appStore.value.brokerInfo?.config?.brokerLink).toBeUndefined();
    });
  });
});
