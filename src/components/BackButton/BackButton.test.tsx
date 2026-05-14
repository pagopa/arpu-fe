import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { useNavigate } from 'react-router-dom';
import '@testing-library/jest-dom';
import { BackButton } from './index';
import { i18nTestSetup } from '__tests__/i18nTestSetup';
import { Mock } from 'vitest';

i18nTestSetup({});

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn()
}));

vi.mock('@mui/icons-material', () => ({
  ArrowBack: () => <div data-testid="ArrowBackIcon" />,
  Close: () => <div data-testid="CloseIcon" />
}));

describe('BackButton Component', () => {
  const navigate = vi.fn();
  (useNavigate as Mock).mockReturnValue(navigate);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with the default translated text', () => {
    render(<BackButton />);
    expect(screen.getByRole('button', { name: 'app.routes.back' })).toBeInTheDocument();
    expect(screen.getByTestId('ArrowBackIcon')).toBeInTheDocument();
  });

  it('renders correctly with custom translated text', () => {
    render(<BackButton text="home" />);
    expect(screen.getByRole('button', { name: 'app.routes.home' })).toBeInTheDocument();
  });

  it('calls navigate with -1 when clicked by default', () => {
    render(<BackButton />);
    const button = screen.getByRole('button', { name: 'app.routes.back' });
    fireEvent.click(button);
    expect(navigate).toHaveBeenCalledWith(-1);
  });

  it('calls custom onClick when provided', () => {
    const customOnClick = vi.fn();
    render(<BackButton onClick={customOnClick} />);
    const button = screen.getByRole('button', { name: 'app.routes.back' });
    fireEvent.click(button);
    expect(customOnClick).toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });

  it('renders with Close icon when icon prop is "exit"', () => {
    render(<BackButton icon="exit" />);
    expect(screen.getByTestId('CloseIcon')).toBeInTheDocument();
    expect(screen.queryByTestId('ArrowBackIcon')).not.toBeInTheDocument();
  });

  it('renders with ArrowBack icon when icon prop is "back"', () => {
    render(<BackButton icon="back" />);
    expect(screen.getByTestId('ArrowBackIcon')).toBeInTheDocument();
    expect(screen.queryByTestId('CloseIcon')).not.toBeInTheDocument();
  });

  it('has the correct aria-label', () => {
    render(<BackButton text="exit" />);
    const button = screen.getByRole('button', { name: 'app.routes.exit' });
    expect(button).toHaveAttribute('aria-label', 'app.routes.exit');
  });
});
