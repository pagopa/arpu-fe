/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest';
import { Formik, Form } from 'formik';
import DATEPICKER from './DATE';
import { render } from '__tests__/renderers';
import React from 'react';

vi.mock('./withDinamicValues', () => ({
  default: (Component: any) => Component
}));

const renderInFormik = (props: any, initialValues: Record<string, unknown> = {}) =>
  render(
    <Formik initialValues={initialValues} onSubmit={vi.fn()}>
      <Form>
        <DATEPICKER {...props} />
      </Form>
    </Formik>
  );

const getHiddenInput = (container: HTMLElement) =>
  container.querySelector('input') as HTMLInputElement;

describe('DATEPICKER', () => {
  it('renders the initial value formatted according to dateFormat', () => {
    const { container } = renderInFormik(
      { name: 'birthDate', value: '2024-01-15', extraAttr: { dateFormat: 'YYYY-MM-DD' } },
      { birthDate: '2024-01-15' }
    );
    expect(getHiddenInput(container)).toHaveValue('2024-01-15');
  });

  it('respects a different dateFormat (DD/MM/YYYY)', () => {
    const { container } = renderInFormik(
      { name: 'birthDate', value: '2024-01-15', extraAttr: { dateFormat: 'DD/MM/YYYY' } },
      { birthDate: '2024-01-15' }
    );
    expect(getHiddenInput(container)).toHaveValue('15/01/2024');
  });

  it('starts empty when value is missing', () => {
    const { container } = renderInFormik(
      { name: 'birthDate', value: undefined, extraAttr: { dateFormat: 'YYYY-MM-DD' } },
      { birthDate: '' }
    );
    expect(getHiddenInput(container)).toHaveValue('');
  });
});
