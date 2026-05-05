import { renderHook } from '@testing-library/react';
import { useFavicon } from './useFavicon';

const getIconLink = () => document.querySelector('link[rel="icon"]') as HTMLLinkElement;

describe('useFavicon', () => {
  beforeEach(() => {
    // Remove any favicon link between tests, this also clears the cached defaultHref dataset
    document.head.querySelectorAll('link[rel="icon"]').forEach((el) => el.remove());
  });

  describe('when faviconUrl is undefined', () => {
    it('does not create a link element if none exists', () => {
      renderHook(() => useFavicon(undefined));

      expect(getIconLink()).toBeNull();
    });

    it('leaves an existing default favicon untouched', () => {
      const existingLink = document.createElement('link');
      existingLink.rel = 'icon';
      existingLink.href = 'https://example.com/default-favicon.ico';
      document.head.appendChild(existingLink);

      renderHook(() => useFavicon(undefined));

      expect(getIconLink().href).toBe('https://example.com/default-favicon.ico');
    });

    it('restores the default favicon when the url becomes undefined', () => {
      type Props = { url: string | undefined };

      const existingLink = document.createElement('link');
      existingLink.rel = 'icon';
      existingLink.href = 'https://example.com/default-favicon.ico';
      document.head.appendChild(existingLink);

      const { rerender } = renderHook(({ url }: Props) => useFavicon(url), {
        initialProps: { url: 'https://example.com/broker-favicon.ico' } satisfies Props
      });

      expect(getIconLink().href).toBe('https://example.com/broker-favicon.ico');

      rerender({ url: undefined });

      expect(getIconLink().href).toBe('https://example.com/default-favicon.ico');
    });
  });

  describe('when faviconUrl is a plain URL (not a data URL)', () => {
    it('creates a link element with the correct href', () => {
      renderHook(() => useFavicon('https://example.com/favicon.ico'));

      expect(getIconLink()).not.toBeNull();
      expect(getIconLink().href).toBe('https://example.com/favicon.ico');
    });

    it('updates an existing link element instead of creating a new one', () => {
      const existingLink = document.createElement('link');
      existingLink.rel = 'icon';
      existingLink.href = 'https://example.com/old-favicon.ico';
      document.head.appendChild(existingLink);

      renderHook(() => useFavicon('https://example.com/new-favicon.ico'));

      expect(document.querySelectorAll('link[rel="icon"]')).toHaveLength(1);
      expect(getIconLink().href).toBe('https://example.com/new-favicon.ico');
    });

    it('updates the favicon when the url changes', () => {
      const { rerender } = renderHook(({ url }: { url: string }) => useFavicon(url), {
        initialProps: { url: 'https://example.com/favicon-v1.ico' }
      });

      expect(getIconLink().href).toBe('https://example.com/favicon-v1.ico');

      rerender({ url: 'https://example.com/favicon-v2.ico' });

      expect(getIconLink().href).toBe('https://example.com/favicon-v2.ico');
    });

    it('does not resize plain URLs', () => {
      const createElementSpy = vi.spyOn(document, 'createElement');

      renderHook(() => useFavicon('https://example.com/favicon.ico'));

      // canvas and img should not be created for plain URLs
      expect(createElementSpy).not.toHaveBeenCalledWith('canvas');
      expect(createElementSpy).not.toHaveBeenCalledWith('img');
    });
  });

  describe('when faviconUrl is a data URL', () => {
    const mockResizedDataUrl = 'data:image/png;base64,resized==';
    const mockDataUrl = 'data:image/png;base64,original==';

    // Stack of all Image instances created during a test, in creation order
    let imageInstances: Array<{ onload: () => void; src: string }>;

    beforeEach(() => {
      imageInstances = [];

      vi.stubGlobal(
        'Image',
        class {
          onload: () => void = () => {};
          private _src = '';
          constructor() {
            imageInstances.push(this as unknown as (typeof imageInstances)[number]);
          }
          set src(value: string) {
            this._src = value;
          }
          get src() {
            return this._src;
          }
        }
      );

      vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
        drawImage: vi.fn()
      } as unknown as CanvasRenderingContext2D);

      vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue(mockResizedDataUrl);
    });

    afterEach(() => {
      vi.unstubAllGlobals();
      vi.restoreAllMocks();
    });

    it('resizes the image and sets the favicon with the resized data URL', () => {
      renderHook(() => useFavicon(mockDataUrl));

      // The hook does not set the favicon until the image fires onload
      expect(getIconLink()).toBeNull();

      imageInstances[0].onload();

      expect(getIconLink()).not.toBeNull();
      expect(getIconLink().href).toBe(mockResizedDataUrl);
    });

    it('creates a 2d canvas context to draw the image', () => {
      renderHook(() => useFavicon(mockDataUrl));
      imageInstances[0].onload();

      expect(HTMLCanvasElement.prototype.getContext).toHaveBeenCalledWith('2d');
      expect(HTMLCanvasElement.prototype.toDataURL).toHaveBeenCalledWith('image/png');
    });

    it('ignores stale onload callbacks when the url changes mid-flight', () => {
      const staleResizedUrl = 'data:image/png;base64,stale==';
      const freshResizedUrl = 'data:image/png;base64,fresh==';

      const toDataURLSpy = vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL');
      // toDataURL is consumed in the order onload callbacks fire, not in image creation order.
      // The fresh image fires first in this test, so its value comes first.
      toDataURLSpy.mockReturnValueOnce(freshResizedUrl).mockReturnValueOnce(staleResizedUrl);

      const { rerender } = renderHook(({ url }: { url: string }) => useFavicon(url), {
        initialProps: { url: mockDataUrl }
      });

      // Url changes before the stale image's onload runs
      rerender({ url: 'data:image/png;base64,fresh-original==' });

      // Fresh image (created on rerender) fires first, sets the favicon to the fresh url
      imageInstances[1].onload();
      expect(getIconLink().href).toBe(freshResizedUrl);

      // Stale image (from the initial render) fires later, should be ignored thanks to the cancelled flag
      imageInstances[0].onload();
      expect(getIconLink().href).toBe(freshResizedUrl);
    });
  });
});
