import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PageTitleProvider } from './PageTitleProvider';
import { usePageTitle } from 'hooks/usePageTitle';
import React from 'react';

vi.mock('hooks/usePageTitle', () => ({
  usePageTitle: vi.fn()
}));

describe('PageTitleProvider component', () => {
  it('should invoke usePageTitle on mount', () => {
    render(<PageTitleProvider />);

    expect(usePageTitle).toHaveBeenCalledTimes(1);
  });

  it('should render nothing in DOM', () => {
    const { container } = render(<PageTitleProvider />);

    expect(container.firstChild).toBeNull();
  });
});
