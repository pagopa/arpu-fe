import getLocalizedDescription from './GetLocalizedDescription';

describe('getLocalizedDescription', () => {
  it('returns the matching language from descriptionI18n', () => {
    const descriptionI18n = { en: 'English Description', de: 'German Description' };
    const result = getLocalizedDescription(descriptionI18n, 'en', 'Fallback');
    expect(result).toBe('English Description');
  });

  it('returns fallback when language is not in descriptionI18n', () => {
    const descriptionI18n = { en: 'English Description' };
    const result = getLocalizedDescription(descriptionI18n, 'fr', 'Descrizione Italiana');
    expect(result).toBe('Descrizione Italiana');
  });

  it('returns fallback when descriptionI18n is undefined', () => {
    const result = getLocalizedDescription(undefined, 'en', 'Descrizione Italiana');
    expect(result).toBe('Descrizione Italiana');
  });

  it('returns fallback when descriptionI18n is an empty object', () => {
    const result = getLocalizedDescription({}, 'en', 'Descrizione Italiana');
    expect(result).toBe('Descrizione Italiana');
  });

  it('tries language prefix when full locale does not match', () => {
    const descriptionI18n = { en: 'English Description' };
    const result = getLocalizedDescription(descriptionI18n, 'en-US', 'Fallback');
    expect(result).toBe('English Description');
  });

  it('prefers full locale over prefix when both exist', () => {
    const descriptionI18n = { en: 'Generic English', 'en-US': 'American English' };
    const result = getLocalizedDescription(descriptionI18n, 'en-US', 'Fallback');
    expect(result).toBe('American English');
  });

  it('falls back to prefix when full locale key does not exist but prefix does', () => {
    const descriptionI18n = { en: 'Generic English', 'en-GB': 'British English' };
    const result = getLocalizedDescription(descriptionI18n, 'en-US', 'Fallback');
    expect(result).toBe('Generic English');
  });

  it('returns fallback when neither full locale nor prefix match', () => {
    const descriptionI18n = { de: 'German Description' };
    const result = getLocalizedDescription(descriptionI18n, 'fr-FR', 'Descrizione Italiana');
    expect(result).toBe('Descrizione Italiana');
  });

  it('handles language string without hyphen (no prefix extraction needed)', () => {
    const descriptionI18n = { it: 'Descrizione Italiana' };
    const result = getLocalizedDescription(descriptionI18n, 'it', 'Default');
    expect(result).toBe('Descrizione Italiana');
  });
});
