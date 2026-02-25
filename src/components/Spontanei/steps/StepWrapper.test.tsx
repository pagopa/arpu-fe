import React from 'react';
import { render, screen, act } from '__tests__/renderers';
import '@testing-library/jest-dom';
import StepWrapper from './StepWrapper';

describe('StepWrapper Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders skeleton initially when isPending is true', () => {
    render(
      <StepWrapper isPending={true}>
        <div data-testid="child-element">Child Content</div>
      </StepWrapper>
    );

    expect(screen.queryByTestId('child-element')).not.toBeInTheDocument();
  });

  it('renders skeleton initially even if isPending is false', () => {
    render(
      <StepWrapper isPending={false}>
        <div data-testid="child-element">Child Content</div>
      </StepWrapper>
    );

    expect(screen.queryByTestId('child-element')).not.toBeInTheDocument();
  });

  it('shows children after 1 second when isPending is false', () => {
    render(
      <StepWrapper isPending={false}>
        <div data-testid="child-element">Child Content</div>
      </StepWrapper>
    );

    expect(screen.queryByTestId('child-element')).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByTestId('child-element')).toBeInTheDocument();
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });

  it('starts the timer when isPending changes from true to false', () => {
    const { rerender } = render(
      <StepWrapper isPending={true}>
        <div data-testid="child-element">Child Content</div>
      </StepWrapper>
    );

    expect(screen.queryByTestId('child-element')).not.toBeInTheDocument();

    rerender(
      <StepWrapper isPending={false}>
        <div data-testid="child-element">Child Content</div>
      </StepWrapper>
    );

    // Still skeleton immediately after change
    expect(screen.queryByTestId('child-element')).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByTestId('child-element')).toBeInTheDocument();
  });
});
