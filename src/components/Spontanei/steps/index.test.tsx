import React from 'react';
import { render, screen } from '__tests__/renderers';
import '@testing-library/jest-dom';
import Steps from './index';
import FormContext, { FormContextType } from '../FormContext';

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
  it('renders 5 steps by default', () => {
    renderWithContext({ activeStep: 0 }, { omitFirstStep: false });

    expect(screen.getByText('spontanei.form.steps.step1.step')).toBeInTheDocument();
    expect(screen.getByText('spontanei.form.steps.step2.step')).toBeInTheDocument();
    expect(screen.getByText('spontanei.form.steps.step3.step')).toBeInTheDocument();
    expect(screen.getByText('spontanei.form.steps.step4.step')).toBeInTheDocument();
    expect(screen.getByText('spontanei.form.steps.step5.step')).toBeInTheDocument();
  });

  it('renders 4 steps when omitFirstStep is true', () => {
    renderWithContext({ activeStep: 0 }, { omitFirstStep: true });

    expect(screen.queryByText('spontanei.form.steps.step1.step')).not.toBeInTheDocument();
    expect(screen.getByText('spontanei.form.steps.step2.step')).toBeInTheDocument();
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

    expect(screen.getByText('spontanei.form.steps.step1.step')).toBeInTheDocument();

    rerender(
      <FormContext.Provider value={getDefaultContext({ omitFirstStep: true })}>
        <Steps activeStep={0} />
      </FormContext.Provider>
    );

    expect(screen.queryByText('spontanei.form.steps.step1.step')).not.toBeInTheDocument();
  });
});
