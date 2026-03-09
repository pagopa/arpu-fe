/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render, screen } from '__tests__/renderers';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import loaders from 'utils/loaders';
import ResourcePage from './ResourcePage';

vi.mock('utils/loaders', () => ({
  default: {
    useResourceContent: vi.fn()
  }
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'it' }
  })
}));

const queryClient = new QueryClient();

const renderWithProviders = (ui: React.ReactElement) =>
  render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);

describe('ResourcePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows error message when fetch fails', () => {
    (loaders.useResourceContent as any).mockReturnValue({
      data: undefined,
      isError: true
    });

    renderWithProviders(<ResourcePage resource="pp" />);

    expect(screen.getByText('errors.resourceNotAvailable')).toBeTruthy();
  });

  it('shows error message when content is null', () => {
    (loaders.useResourceContent as any).mockReturnValue({
      data: null,
      isError: false
    });

    renderWithProviders(<ResourcePage resource="tos" />);

    expect(screen.getByText('errors.resourceNotAvailable')).toBeTruthy();
  });

  it('renders markdown content when fetch succeeds', () => {
    const mdContent = '**Termini di Servizio**';

    (loaders.useResourceContent as any).mockReturnValue({
      data: mdContent,
      isError: false
    });

    renderWithProviders(<ResourcePage resource="tos" />);

    const el = screen.getByText('Termini di Servizio');
    expect(el).toBeTruthy();
    expect(el.tagName).toBe('STRONG');
  });

  it('passes pp resource type and language to useResourceContent', () => {
    (loaders.useResourceContent as any).mockReturnValue({
      data: 'content',
      isError: false
    });

    renderWithProviders(<ResourcePage resource="pp" />);

    expect(loaders.useResourceContent).toHaveBeenCalledWith('pp', 'it');
  });

  it('passes tos resource type and language to useResourceContent', () => {
    (loaders.useResourceContent as any).mockReturnValue({
      data: 'content',
      isError: false
    });

    renderWithProviders(<ResourcePage resource="tos" />);

    expect(loaders.useResourceContent).toHaveBeenCalledWith('tos', 'it');
  });
});
