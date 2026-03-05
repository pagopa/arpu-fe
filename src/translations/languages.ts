import { Languages } from '@pagopa/mui-italia';

const langMap = {
  it: 'italiano',
  en: 'english',
  fr: 'français',
  sl: 'slovenski',
  de: 'deutsch'
};

// Done this way to respect switcher component props
export const languages: Languages = {
  it: langMap,
  en: langMap,
  fr: langMap,
  sl: langMap,
  de: langMap
};
