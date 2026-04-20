import { parseBrokerConfig, applyBrokerTranslations } from './brokerconfig';
import i18n from 'translations/i18n';

vi.mock('translations/i18n', () => ({
  default: {
    addResourceBundle: vi.fn()
  }
}));

describe('brokerconfig', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  describe('parseBrokerConfig', () => {
    it('warns and returns early when raw is undefined', () => {
      parseBrokerConfig(undefined);

      expect(console.warn).toHaveBeenCalledWith('[brokerConfig] Config is missing.');
    });

    it('warns and returns early when raw is an empty string', () => {
      parseBrokerConfig('');

      expect(console.warn).toHaveBeenCalledWith('[brokerConfig] Config is missing.');
    });

    it('warns when raw is not valid JSON', () => {
      parseBrokerConfig('not-valid-json');

      expect(console.warn).toHaveBeenCalledWith('[brokerConfig] not a valid JSON.');
    });

    it('warns when JSON does not match the schema', () => {
      parseBrokerConfig(JSON.stringify({ unexpected: 'field' }));

      expect(console.warn).toHaveBeenCalledWith(
        '[brokerConfig] validation failed:',
        expect.any(Object)
      );
    });

    it('does not warn when config is valid', () => {
      const validConfig = {
        translation: {
          en: { greeting: 'Hello' },
          it: { greeting: 'Ciao' }
        }
      };

      const result = parseBrokerConfig(JSON.stringify(validConfig));

      expect(console.warn).not.toHaveBeenCalled();
      expect(result.a11yLink).toBeUndefined();
    });

    it('parses a11yLink when present in config', () => {
      const configWithA11y = {
        translation: {
          it: { greeting: 'Ciao' }
        },
        a11yLink: 'https://test.it'
      };

      const result = parseBrokerConfig(JSON.stringify(configWithA11y));

      expect(console.warn).not.toHaveBeenCalled();
      expect(result.a11yLink).toBe('https://test.it');
    });

    it('parses assistanceLink when present', () => {
      const validConfig = {
        translation: { en: { greeting: 'Hello' } },
        assistanceLink: 'https://demo.it/faq'
      };

      const result = parseBrokerConfig(JSON.stringify(validConfig));

      expect(result.assistanceLink).toBe('https://demo.it/faq');
    });

    it('parses brokerLink when present', () => {
      const validConfig = {
        translation: { en: { greeting: 'Hello' } },
        brokerLink: 'https://broker.example.com'
      };

      const result = parseBrokerConfig(JSON.stringify(validConfig));

      expect(console.warn).not.toHaveBeenCalled();
      expect(result.brokerLink).toBe('https://broker.example.com');
    });

    it('returns undefined brokerLink when not present', () => {
      const validConfig = {
        translation: { en: { greeting: 'Hello' } }
      };

      const result = parseBrokerConfig(JSON.stringify(validConfig));

      expect(result.brokerLink).toBeUndefined();
    });

    it('fails validation when brokerLink is not a valid URL', () => {
      const invalidConfig = {
        translation: { en: { greeting: 'Hello' } },
        brokerLink: 'not-a-url'
      };

      parseBrokerConfig(JSON.stringify(invalidConfig));

      expect(console.warn).toHaveBeenCalledWith(
        '[brokerConfig] validation failed:',
        expect.any(Object)
      );
    });

    it('parses homeLink when present', () => {
      const validConfig = {
        translation: { en: { greeting: 'Hello' } },
        homeLink: 'https://home.example.com'
      };

      const result = parseBrokerConfig(JSON.stringify(validConfig));

      expect(console.warn).not.toHaveBeenCalled();
      expect(result.homeLink).toBe('https://home.example.com');
    });

    it('returns undefined homeLink when not present', () => {
      const validConfig = {
        translation: { en: { greeting: 'Hello' } }
      };

      const result = parseBrokerConfig(JSON.stringify(validConfig));

      expect(result.homeLink).toBeUndefined();
    });

    it('fails validation when homeLink is not a valid URL', () => {
      const invalidConfig = {
        translation: { en: { greeting: 'Hello' } },
        homeLink: 'not-a-url'
      };

      parseBrokerConfig(JSON.stringify(invalidConfig));

      expect(console.warn).toHaveBeenCalledWith(
        '[brokerConfig] validation failed:',
        expect.any(Object)
      );
    });

    it('parses downloadInfoLink when present', () => {
      const validConfig = {
        translation: { en: { greeting: 'Hello' } },
        downloadInfoLink: 'https://download.example.com/info'
      };

      const result = parseBrokerConfig(JSON.stringify(validConfig));

      expect(console.warn).not.toHaveBeenCalled();
      expect(result.downloadInfoLink).toBe('https://download.example.com/info');
    });

    it('returns undefined downloadInfoLink when not present', () => {
      const validConfig = {
        translation: { en: { greeting: 'Hello' } }
      };

      const result = parseBrokerConfig(JSON.stringify(validConfig));

      expect(result.downloadInfoLink).toBeUndefined();
    });

    it('fails validation when downloadInfoLink is not a valid URL', () => {
      const invalidConfig = {
        translation: { en: { greeting: 'Hello' } },
        downloadInfoLink: 'not-a-url'
      };

      parseBrokerConfig(JSON.stringify(invalidConfig));

      expect(console.warn).toHaveBeenCalledWith(
        '[brokerConfig] validation failed:',
        expect.any(Object)
      );
    });
  });

  describe('applyBrokerTranslations', () => {
    it('calls addResourceBundle for each language in the config', () => {
      const translationConfig = {
        en: { key: 'value' },
        it: { key: 'valore' },
        de: { key: 'Wert' }
      };

      applyBrokerTranslations(translationConfig);

      expect(i18n.addResourceBundle).toHaveBeenCalledTimes(3);
      expect(i18n.addResourceBundle).toHaveBeenCalledWith(
        'en',
        'translation',
        { key: 'value' },
        true,
        true
      );
      expect(i18n.addResourceBundle).toHaveBeenCalledWith(
        'it',
        'translation',
        { key: 'valore' },
        true,
        true
      );
      expect(i18n.addResourceBundle).toHaveBeenCalledWith(
        'de',
        'translation',
        { key: 'Wert' },
        true,
        true
      );
    });

    it('calls addResourceBundle with deep=true and overwrite=true', () => {
      applyBrokerTranslations({ translation: { en: { key: 'value' } } });

      const call = vi.mocked(i18n.addResourceBundle).mock.calls[0];
      expect(call[3]).toBe(true); // deep
      expect(call[4]).toBe(true); // overwrite
    });
  });
});
