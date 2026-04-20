import React from 'react';
import { render, screen } from '@testing-library/react';
import MULTIFIELD from './MULTIFIELD';
import { BuildFormInputs } from '../config';
import { RenderType, SpontaneousFormField } from '../../../../../generated/apiClient';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../config', () => ({
  BuildFormInputs: vi.fn(() => <div data-testid="subfields" />)
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

describe('MULTIFIELD', () => {
  it('renders the label and calls BuildFormInputs with subfields', () => {
    const mockInput = createField({
      name: 'multifield',
      htmlLabel: 'Test Label',
      htmlRender: RenderType.MULTIFIELD,
      subfields: [createField({ name: 'subfield1', htmlLabel: 'Subfield 1' })]
    });

    render(<MULTIFIELD input={mockInput} />);

    expect(screen.getByText('Test Label')).toBeInTheDocument();
    expect(BuildFormInputs).toHaveBeenCalledWith(mockInput.subfields, false);
    expect(screen.getByTestId('subfields')).toBeInTheDocument();
  });

  it('renders correctly without subfields', () => {
    const mockInput = createField({
      name: 'multifield',
      htmlLabel: 'Empty Label',
      htmlRender: RenderType.MULTIFIELD
    });

    render(<MULTIFIELD input={mockInput} />);

    expect(screen.getByText('Empty Label')).toBeInTheDocument();
    expect(BuildFormInputs).toHaveBeenCalledWith([], false);
  });
});
