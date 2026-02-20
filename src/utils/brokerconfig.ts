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
  translation: ResourceSchema
});

export type BrokerConfig = z.infer<typeof BrokerConfigSchema>;

/**
 * Parses and validates the broker config string.
 */
export const parseBrokerConfig = (raw?: string) => {
  if (!raw) {
    console.warn('[brokerConfig] Config is missing.');
  } else {
    try {
      const parsed = JSON.parse(raw);
      const result = BrokerConfigSchema.safeParse(parsed);
      if (!result.success) {
        console.warn('[brokerConfig] validation failed:', result.error.flatten());
      } else {
        applyBrokerTranslations(result.data);
      }
    } catch {
      console.warn('[brokerConfig] not a valid JSON.');
    }
  }
};

/**
 * Applies broker translations to i18next if present in the config.
 * Uses addResourceBundle with deep=true, overwrite=true so broker keys win.
 */
export const applyBrokerTranslations = (config: BrokerConfig | null): void => {
  Object.entries(config?.translation || {}).forEach(([lang, translations]) =>
    i18n.addResourceBundle(lang, 'translation', translations, true, true)
  );
};
