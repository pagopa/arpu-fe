import { useEffect } from 'react';

export const useFavicon = (faviconUrl: string | undefined) => {
  useEffect(() => {
    // No favicon from broker config, restore the default from index.html
    if (!faviconUrl) {
      restoreDefaultFavicon();
      return;
    }

    // Plain URL, use it directly without resizing
    if (!faviconUrl.startsWith('data:')) {
      setFavicon(faviconUrl);
      return;
    }

    // Data URL, resize to 32x32 via canvas and handle race conditions
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, 32, 32);
      setFavicon(canvas.toDataURL('image/png'));
    };
    img.src = faviconUrl;

    return () => {
      cancelled = true;
    };
  }, [faviconUrl]);
};

const FAVICON_SELECTOR = 'link[rel="icon"]';

const setFavicon = (url: string) => {
  const link = document.querySelector(FAVICON_SELECTOR) as HTMLLinkElement | null;
  if (link) {
    // Cache the original href once, so we can restore it later
    if (!link.dataset.defaultHref) {
      link.dataset.defaultHref = link.href;
    }
    link.href = url;
  } else {
    const newLink = document.createElement('link');
    newLink.rel = 'icon';
    newLink.href = url;
    document.head.appendChild(newLink);
  }
};

const restoreDefaultFavicon = () => {
  const link = document.querySelector(FAVICON_SELECTOR) as HTMLLinkElement | null;
  if (link?.dataset.defaultHref) {
    link.href = link.dataset.defaultHref;
  }
};
