import { usePageTitle } from 'hooks/usePageTitle';

/**
 * Invisible component that activates automatic page title management.
 * Place this once in each layout (Layout, PreLoginLayout).
 *
 * It reads the `titleKey` from the current route's handle
 * and sets document.title accordingly.
 */
export const PageTitleProvider = () => {
  usePageTitle();
  return null;
};
