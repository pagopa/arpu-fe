import React from 'react';
import { render, screen, act } from '__tests__/renderers';
import '@testing-library/jest-dom';
import Steps from './index';
import FormContext, { FormContextType } from '../FormContext';
import { vi } from 'vitest';

vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query');
  return {
    ...actual,
    useIsFetching: vi.fn().mockReturnValue(1)
  };
});

const getDefaultContext = (overrides: Partial<FormContextType> = {}): FormContextType => ({
  step: 0,
  setStep: vi.fn(),
  omitFirstStep: false,
  setOmitFirstStep: vi.fn(),
  formType: null,
  setFormType: vi.fn(),
  userDescription: null,
  setUserDescription: vi.fn(),
  ...overrides
});

const renderWithContext = (
  props: { activeStep: number },
  contextValue: Partial<FormContextType> = {}
) => {
  const defaultContext = getDefaultContext(contextValue);

  return render(
    <FormContext.Provider value={defaultContext}>
      <Steps {...props} />
    </FormContext.Provider>
  );
};

describe('Steps Component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders 5 steps by default', () => {
    renderWithContext({ activeStep: 0 }, { omitFirstStep: false });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(
      screen.getByText('spontanei.form.steps.step1.step', {
        selector: '.MuiStepLabel-label'
      })
    ).toBeInTheDocument();
    expect(screen.getByText('spontanei.form.steps.step2.step')).toBeInTheDocument();
    expect(screen.getByText('spontanei.form.steps.step3.step')).toBeInTheDocument();
    expect(screen.getByText('spontanei.form.steps.step4.step')).toBeInTheDocument();
    expect(screen.getByText('spontanei.form.steps.step5.step')).toBeInTheDocument();
  });

  it('renders 4 steps when omitFirstStep is true', () => {
    renderWithContext({ activeStep: 0 }, { omitFirstStep: true });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // wait for one of the steps to be in the document to ensure skeleton is gone
    expect(screen.getByText('spontanei.form.steps.step2.step')).toBeInTheDocument();
    expect(screen.queryByText('spontanei.form.steps.step1.step')).not.toBeInTheDocument();
    expect(screen.getByText('spontanei.form.steps.step3.step')).toBeInTheDocument();
    expect(screen.getByText('spontanei.form.steps.step4.step')).toBeInTheDocument();
    expect(screen.getByText('spontanei.form.steps.step5.step')).toBeInTheDocument();
  });

  it('updates steps dynamically if omitFirstStep changes', () => {
    const { rerender } = render(
      <FormContext.Provider value={getDefaultContext({ omitFirstStep: false })}>
        <Steps activeStep={0} />
      </FormContext.Provider>
    );

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(
      screen.getByText('spontanei.form.steps.step1.step', {
        selector: '.MuiStepLabel-label'
      })
    ).toBeInTheDocument();

    rerender(
      <FormContext.Provider value={getDefaultContext({ omitFirstStep: true })}>
        <Steps activeStep={0} />
      </FormContext.Provider>
    );

    act(() => {
      vi.advanceTimersByTime(1000); // Need to wait for next render cycle probably not needed but safe
    });
    expect(screen.queryByText('spontanei.form.steps.step1.step')).not.toBeInTheDocument();
  });
});
