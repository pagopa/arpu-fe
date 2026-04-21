import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { Formik } from 'formik';
import TAB from './TAB';
import { computeValue } from '../config';
import { RenderType, SpontaneousFormField } from '../../../../../generated/apiClient';
import { describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom';

vi.mock('../config', () => ({
  BuildFormInputs: vi.fn(() => <div data-testid="subfield-input" />),
  computeValue: vi.fn(),
  backToOriginalScope: vi.fn((v) => v),
  buildDinamicValue: vi.fn((t) => t),
  flattenObject: vi.fn((v) => v),
  getPlaceholders: vi.fn(() => [])
}));

const createField = (overrides: Partial<SpontaneousFormField> = {}): SpontaneousFormField =>
  ({
    name: 'field',
    required: false,
    htmlRender: RenderType.TEXT,
    htmlClass: 'full',
    htmlLabel: 'Field',
    defaultValue: '',
    insertableOrder: 0,
    indexable: false,
    renderableOrder: 0,
    searchableOrder: 0,
    listableOrder: 0,
    minOccurences: 0,
    maxOccurences: 1,
    insertable: true,
    renderable: true,
    listable: false,
    detailLink: false,
    searchable: false,
    association: false,
    ...overrides
  }) as SpontaneousFormField;

const mockSubfields = [
  createField({
    name: 'tab1',
    htmlLabel: 'Tab 1',
    htmlRender: RenderType.TEXT,
    enabledDependsOn: 'return true',
    renderableOrder: 0,
    subfields: [createField({ name: 'sub1', htmlLabel: 'Sub 1' })]
  }),
  createField({
    name: 'tab2',
    htmlLabel: 'Tab 2',
    htmlRender: RenderType.TEXT,
    enabledDependsOn: 'return false',
    renderableOrder: 1,
    subfields: [createField({ name: 'sub2', htmlLabel: 'Sub 2' })]
  })
];

describe('TAB component', () => {
  it('renders tabs and handles enabled/disabled state', () => {
    vi.mocked(computeValue).mockImplementation((code: string) => code === 'return true');

    render(
      <Formik initialValues={{ myTabField: 'tab1' }} onSubmit={vi.fn()}>
        <TAB
          name="myTabField"
          subfields={mockSubfields}
          htmlRender={RenderType.TAB}
          htmlLabel="Tab Group"
          defaultValue="tab1"
          insertableOrder={0}
          indexable={false}
          renderableOrder={0}
          searchableOrder={0}
          listableOrder={0}
          insertable
          renderable
          searchable={false}
          listable={false}
          association={false}
          detailLink={false}
          minOccurences={1}
          maxOccurences={1}
        />
      </Formik>
    );

    // Check tabs are rendered
    expect(screen.getByText('Tab 1')).toBeInTheDocument();
    expect(screen.getByText('Tab 2')).toBeInTheDocument();

    // Tab 2 should be disabled if computeValue returns false
    const tab2 = screen.getByRole('tab', { name: 'Tab 2' });
    expect(tab2).toBeDisabled();

    // Tab 1 should be enabled
    const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
    expect(tab1).not.toBeDisabled();

    // Check subfield inputs are rendered
    expect(screen.getAllByTestId('subfield-input')).toHaveLength(1);
  });

  it('changes active tab on click', async () => {
    vi.mocked(computeValue).mockImplementation(() => true);

    render(
      <Formik initialValues={{ myTabField: 'tab1' }} onSubmit={vi.fn()}>
        <TAB
          name="myTabField"
          subfields={mockSubfields}
          htmlRender={RenderType.TAB}
          htmlLabel="Tab Group"
          defaultValue="tab1"
          insertableOrder={0}
          indexable={false}
          renderableOrder={0}
          searchableOrder={0}
          listableOrder={0}
          insertable
          renderable
          searchable={false}
          listable={false}
          association={false}
          detailLink={false}
          minOccurences={1}
          maxOccurences={1}
        />
      </Formik>
    );

    const tab1 = screen.getByRole('tab', { name: 'Tab 1' });
    const tab2 = screen.getByRole('tab', { name: 'Tab 2' });

    expect(tab1).toHaveAttribute('aria-selected', 'true');
    expect(tab2).toHaveAttribute('aria-selected', 'false');

    // Click on Tab 2
    fireEvent.click(tab2);

    // Wait for the change to be reflected
    expect(tab2).toHaveAttribute('aria-selected', 'true');
    expect(tab1).toHaveAttribute('aria-selected', 'false');
  });
});
