import i18n from 'translations/i18n';
import { z } from 'zod';

const ResourceKeySchema: z.ZodType = z.union([
  z.string(),
  z.lazy(() => z.record(z.string(), z.any()))
]);

const ResourceLanguageSchema = z.record(z.string(), ResourceKeySchema);

const ResourceSchema = z.record(z.string(), ResourceLanguageSchema);

// Zod schema for the broker config string.
const BrokerConfigSchema = z.object({
  translation: ResourceSchema,
  useCart: z.boolean().optional(),
  assistanceLink: z.string().url().optional(),
  a11yLink: z.string().optional(),
  externalLoginUrl: z.string().url().optional()
});

export type BrokerConfig = z.infer<typeof BrokerConfigSchema>;

export const defaultBrokerConfig: BrokerConfig = {
  translation: {},
  useCart: true
};

/**
 * Parses and validates the broker config string.
 * Returns a default config if the input is invalid or missing.
 */
export const parseBrokerConfig = (raw?: string): BrokerConfig => {
  if (!raw) {
    console.warn('[brokerConfig] Config is missing.');
  } else {
    try {
      const parsed = JSON.parse(raw);
      const result = BrokerConfigSchema.safeParse(parsed);
      if (!result.success) {
        console.warn('[brokerConfig] validation failed:', result.error.flatten());
      } else {
        return result.data;
      }
    } catch {
      console.warn('[brokerConfig] not a valid JSON.');
    }
  }
  return defaultBrokerConfig;
};

/**
 * Applies broker translations to i18next if present in the config.
 * Uses addResourceBundle with deep=true, overwrite=true so broker keys win.
 */
export const applyBrokerTranslations = (translationConfig: BrokerConfig['translation']): void => {
  Object.entries(translationConfig || {}).forEach(([lang, translations]) =>
    i18n.addResourceBundle(lang, 'translation', translations, true, true)
  );
};
