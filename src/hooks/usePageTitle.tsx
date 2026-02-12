import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useMatches } from 'react-router-dom';
import { RouteHandleObject } from 'models/Breadcrumbs';

/**
 * Hook that manages the document title based on the current route.
 *
 * Reads `titleKey` from the matched route's `handle` property,
 * translates it via i18n and sets `document.title`.
 *
 * Accepts an optional `dynamicTitle` for detail pages where the
 * title depends on loaded data (e.g. receipt or debt position name).
 * When dynamicTitle is provided and truthy, it takes precedence.
 * While data is loading (dynamicTitle is undefined), the static title is shown.
 *
 * @param dynamicTitle - Optional override from page data
 *
 * @example
 * // Static page — title resolved from route handle automatically:
 * usePageTitle();
 *
 * // Detail page — dynamic title from API data:
 * usePageTitle(data?.debtPositionTypeOrgDescription);
 */
export const usePageTitle = (dynamicTitle?: string | null) => {
  const { t } = useTranslation();
  const matches = useMatches();

  useEffect(() => {
    const appTitle = t('app.title');

    if (dynamicTitle) {
      document.title = `${dynamicTitle} - ${appTitle}`;
      return;
    }

    // Find the deepest matched route that has a titleKey
    const matchWithTitle = [...matches]
      .reverse()
      .find((match) => (match.handle as RouteHandleObject)?.titleKey);

    if (matchWithTitle) {
      const { titleKey } = matchWithTitle.handle as RouteHandleObject;
      document.title = `${t(titleKey!)} - ${appTitle}`;
    } else {
      document.title = appTitle;
    }
  }, [matches, dynamicTitle, t]);
};
