import { renderHook } from '@testing-library/react';
import { useFavicon } from './useFavicon';

const getIconLink = () => document.querySelector('link[rel="icon"]') as HTMLLinkElement;

describe('useFavicon', () => {
  beforeEach(() => {
    // Clean up any favicon link elements between tests
    document.head.querySelectorAll('link[rel="icon"]').forEach((el) => el.remove());
  });

  describe('when faviconUrl is undefined', () => {
    it('does not create a link element', () => {
      renderHook(() => useFavicon(undefined));

      expect(getIconLink()).toBeNull();
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
      const { rerender } = renderHook(({ url }) => useFavicon(url), {
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

    beforeEach(() => {
      vi.stubGlobal(
        'Image',
        class {
          onload: () => void = () => {};
          set src(_: string) {
            this.onload();
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

    it('resizes the image and sets the favicon with the resized data URL', async () => {
      const { rerender } = renderHook(() => useFavicon(mockDataUrl));

      await new Promise((r) => setTimeout(r, 0));
      rerender();

      expect(getIconLink()).not.toBeNull();
      expect(getIconLink().href).toBe(mockResizedDataUrl);
    });

    it('creates a canvas with 32x32 dimensions', async () => {
      renderHook(() => useFavicon(mockDataUrl));
      await new Promise((r) => setTimeout(r, 0));

      expect(HTMLCanvasElement.prototype.toDataURL).toHaveBeenCalledWith('image/png');
    });

    it('draws the image onto the canvas', async () => {
      renderHook(() => useFavicon(mockDataUrl));
      await new Promise((r) => setTimeout(r, 0));

      expect(HTMLCanvasElement.prototype.getContext).toHaveBeenCalledWith('2d');
    });
  });
});
