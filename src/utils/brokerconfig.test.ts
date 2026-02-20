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
      expect(i18n.addResourceBundle).not.toHaveBeenCalled();
    });

    it('warns and returns early when raw is an empty string', () => {
      parseBrokerConfig('');

      expect(console.warn).toHaveBeenCalledWith('[brokerConfig] Config is missing.');
      expect(i18n.addResourceBundle).not.toHaveBeenCalled();
    });

    it('warns when raw is not valid JSON', () => {
      parseBrokerConfig('not-valid-json');

      expect(console.warn).toHaveBeenCalledWith('[brokerConfig] not a valid JSON.');
      expect(i18n.addResourceBundle).not.toHaveBeenCalled();
    });

    it('warns and does not apply translations when JSON does not match the schema', () => {
      parseBrokerConfig(JSON.stringify({ unexpected: 'field' }));

      expect(console.warn).toHaveBeenCalledWith(
        '[brokerConfig] validation failed:',
        expect.any(Object)
      );
      expect(i18n.addResourceBundle).not.toHaveBeenCalled();
    });

    it('applies translations and does not warn when config is valid', () => {
      const validConfig = {
        translation: {
          en: { greeting: 'Hello' },
          it: { greeting: 'Ciao' }
        }
      };

      parseBrokerConfig(JSON.stringify(validConfig));

      expect(console.warn).not.toHaveBeenCalled();
      expect(i18n.addResourceBundle).toHaveBeenCalledTimes(2);
      expect(i18n.addResourceBundle).toHaveBeenCalledWith(
        'en',
        'translation',
        { greeting: 'Hello' },
        true,
        true
      );
      expect(i18n.addResourceBundle).toHaveBeenCalledWith(
        'it',
        'translation',
        { greeting: 'Ciao' },
        true,
        true
      );
    });

    it('handles nested translation keys correctly', () => {
      const validConfig = {
        translation: {
          en: { section: { title: 'Title', subtitle: 'Subtitle' } }
        }
      };

      parseBrokerConfig(JSON.stringify(validConfig));

      expect(console.warn).not.toHaveBeenCalled();
      expect(i18n.addResourceBundle).toHaveBeenCalledWith(
        'en',
        'translation',
        { section: { title: 'Title', subtitle: 'Subtitle' } },
        true,
        true
      );
    });
  });

  describe('applyBrokerTranslations', () => {
    it('does nothing when config is null', () => {
      applyBrokerTranslations(null);

      expect(i18n.addResourceBundle).not.toHaveBeenCalled();
    });

    it('does nothing when translation is an empty object', () => {
      applyBrokerTranslations({ translation: {} });

      expect(i18n.addResourceBundle).not.toHaveBeenCalled();
    });

    it('calls addResourceBundle for each language in the config', () => {
      const config = {
        translation: {
          en: { key: 'value' },
          it: { key: 'valore' },
          de: { key: 'Wert' }
        }
      };

      applyBrokerTranslations(config);

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
