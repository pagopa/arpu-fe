import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PageTitleProvider } from './PageTitleProvider';
import { usePageTitle } from 'hooks/usePageTitle';
import React from 'react';

vi.mock('hooks/usePageTitle', () => ({
  usePageTitle: vi.fn()
}));

describe('PageTitleProvider component', () => {
  it('dovrebbe invocare usePageTitle al montaggio', () => {
    render(<PageTitleProvider />);

    expect(usePageTitle).toHaveBeenCalledTimes(1);
  });

  it('non dovrebbe renderizzare nulla nel DOM', () => {
    const { container } = render(<PageTitleProvider />);

    expect(container.firstChild).toBeNull();
  });
});
