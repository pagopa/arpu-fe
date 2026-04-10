/**
 * Resolves the localized description trying full locale first (e.g. "it-IT"),
 * then the language prefix (e.g. "it"), falling back to the default description.
 */
const getLocalizedDescription = (
  descriptionI18n: Record<string, string> | undefined,
  language: string,
  fallback: string
): string => descriptionI18n?.[language] ?? descriptionI18n?.[language.split('-')[0]] ?? fallback;

export default getLocalizedDescription;
