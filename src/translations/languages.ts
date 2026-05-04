import { Languages } from '@pagopa/mui-italia';

const langMap = {
  it: 'Italiano',
  en: 'English',
  fr: 'Français',
  de: 'Deutsch'
};

// Done this way to respect switcher component props
export const languages: Languages = {
  it: langMap,
  en: langMap,
  fr: langMap,
  de: langMap
};
