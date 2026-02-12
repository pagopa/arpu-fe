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

  it('should set titles based on the route titleKey', () => {
    vi.mocked(useMatches).mockReturnValue([
      {
        handle: { titleKey: 'pageTitles.dashboard' }
      } as any
    ]);

    renderHook(() => usePageTitle());

    expect(document.title).toBe('Dashboard - Area Riservata');
  });

  it('should prioritize dynamicTitle if present', () => {
    vi.mocked(useMatches).mockReturnValue([
      {
        handle: { titleKey: 'pageTitles.dashboard' }
      } as any
    ]);

    renderHook(() => usePageTitle('Titolo Dinamico'));

    expect(document.title).toBe('Titolo Dinamico - Area Riservata');
  });

  it('should use only appTitle if both titleKey and dynamicTitle are absent', () => {
    vi.mocked(useMatches).mockReturnValue([]);

    renderHook(() => usePageTitle());

    expect(document.title).toBe('Area Riservata');
  });
});
