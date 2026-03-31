import { useEffect, useMemo } from 'react';

export const useFavicon = (faviconUrl: string | undefined) => {
  const resizedUrl = useMemo(() => {
    if (!faviconUrl) return undefined;

    // Only resize if it's a data URL
    if (!faviconUrl.startsWith('data:')) {
      return faviconUrl;
    }

    // Resize once and cache
    return new Promise<string>((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, 32, 32);
        resolve(canvas.toDataURL('image/png'));
      };
      img.src = faviconUrl;
    });
  }, [faviconUrl]);

  useEffect(() => {
    if (!resizedUrl) return;

    if (typeof resizedUrl === 'string') {
      setFavicon(resizedUrl);
    } else {
      resizedUrl.then(setFavicon);
    }
  }, [resizedUrl]);
};

const setFavicon = (url: string) => {
  const link = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
  if (link) {
    link.href = url;
  } else {
    const newLink = document.createElement('link');
    newLink.rel = 'icon';
    newLink.href = url;
    document.head.appendChild(newLink);
  }
};
