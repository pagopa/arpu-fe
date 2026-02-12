/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePageTitle } from './usePageTitle';
import { useMatches } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

vi.mock('react-router-dom', () => ({
  useMatches: vi.fn()
}));

vi.mock('react-i18next', () => ({
  useTranslation: vi.fn()
}));

describe('usePageTitle hook', () => {
  const tMock = (key: string) => {
    const keys: Record<string, string> = {
      'app.title': 'Area Riservata',
      'pageTitles.dashboard': 'Dashboard'
    };
    return keys[key] || key;
  };

  beforeEach(() => {
    vi.mocked(useTranslation).mockReturnValue({ t: tMock } as any);
    document.title = '';
  });

  it('dovrebbe impostare il titolo basandosi sul titleKey della rotta', () => {
    vi.mocked(useMatches).mockReturnValue([
      {
        handle: { titleKey: 'pageTitles.dashboard' }
      } as any
    ]);

    renderHook(() => usePageTitle());

    expect(document.title).toBe('Dashboard - Area Riservata');
  });

  it('dovrebbe dare priorità al dynamicTitle se fornito', () => {
    vi.mocked(useMatches).mockReturnValue([
      {
        handle: { titleKey: 'pageTitles.dashboard' }
      } as any
    ]);

    renderHook(() => usePageTitle('Titolo Dinamico'));

    expect(document.title).toBe('Titolo Dinamico - Area Riservata');
  });

  it("dovrebbe usare solo il titolo dell'app se non trova titleKey né dynamicTitle", () => {
    vi.mocked(useMatches).mockReturnValue([]);

    renderHook(() => usePageTitle());

    expect(document.title).toBe('Area Riservata');
  });
});
