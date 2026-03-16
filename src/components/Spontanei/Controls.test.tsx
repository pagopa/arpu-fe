import React from 'react';
import { render, screen, fireEvent, waitFor } from '__tests__/renderers';
import '@testing-library/jest-dom';
import Controls, { ControlsProps } from './Controls';
import FormContext, { FormContextType } from './FormContext';
import { useNavigate } from 'react-router-dom';
import { Mock } from 'vitest';

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn()
}));

const mockNavigate = vi.fn();
(useNavigate as Mock).mockReturnValue(mockNavigate);

const renderWithContext = (props: ControlsProps, contextValue: Partial<FormContextType> = {}) => {
  const defaultContext: FormContextType = {
    step: 0,
    setStep: vi.fn(),
    omitFirstStep: false,
    setOmitFirstStep: vi.fn(),
    formType: null,
    setFormType: vi.fn(),
    userDescription: null,
    setUserDescription: vi.fn(),
    ...contextValue
  };

  return render(
    <FormContext.Provider value={defaultContext}>
      <Controls {...props} />
    </FormContext.Provider>
  );
};

describe('Controls Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders step 0 correctly: test if back button is hidden', () => {
    renderWithContext({ shouldContinue: vi.fn() }, { step: 0 });

    const backButton = screen.queryByTestId('spontanei-controls-back-button');
    expect(backButton).not.toBeInTheDocument();
  });

  it('renders step 1 correctly: shows Back and calls setStep(0)', () => {
    const setStep = vi.fn();
    renderWithContext({ shouldContinue: vi.fn() }, { step: 1, setStep });

    const backButton = screen.getByTestId('spontanei-controls-back-button');
    expect(backButton).toBeInTheDocument();

    fireEvent.click(backButton);
    expect(setStep).toHaveBeenCalledWith(0);
  });

  it('handles omitFirstStep: back button on step 1 hidden', () => {
    renderWithContext({ shouldContinue: vi.fn() }, { step: 1, omitFirstStep: true });

    const backButton = screen.queryByTestId('spontanei-controls-back-button');
    expect(backButton).not.toBeInTheDocument();
  });

  it('renders confirm button on step 4', () => {
    renderWithContext({ shouldContinue: vi.fn() }, { step: 4 });
    expect(screen.getByTestId('spontanei-controls-continue-button')).toBeInTheDocument();
  });

  it('calls onContinue and updates step on success', async () => {
    const setStep = vi.fn();
    const shouldContinue = vi.fn().mockResolvedValue(true);
    renderWithContext({ shouldContinue }, { step: 1, setStep });

    const continueButton = screen.getByTestId('spontanei-controls-continue-button');
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(shouldContinue).toHaveBeenCalled();
      expect(setStep).toHaveBeenCalledWith(2);
    });
  });

  it('calls onContinue and does NOT update step on failure', async () => {
    const setStep = vi.fn();
    const shouldContinue = vi.fn().mockResolvedValue(false);
    renderWithContext({ shouldContinue }, { step: 1, setStep });

    const continueButton = screen.getByTestId('spontanei-controls-continue-button');
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(shouldContinue).toHaveBeenCalled();
      expect(setStep).not.toHaveBeenCalled();
    });
  });

  it('hides continue button when hideContinue is true', () => {
    renderWithContext({ hideContinue: true }, { step: 1 });
    expect(screen.queryByTestId('spontanei-controls-continue-button')).not.toBeInTheDocument();
  });
});
