import { describe, expect, it } from 'vitest';
import { RenderType } from '../../../../generated/apiClient';
import { BuildFormState, normalizeSelectValue } from './config';

describe('Spontanei dynamic form config', () => {
  it('normalizes empty select values to null', () => {
    expect(normalizeSelectValue(undefined)).toBeNull();
    expect(normalizeSelectValue('')).toBeNull();
    expect(normalizeSelectValue('   ')).toBeNull();
  });

  it('maps static select default values to option objects', () => {
    const state = BuildFormState([
      {
        name: 'comune',
        htmlRender: RenderType.SINGLESELECT,
        enumerationList: ['Roma', 'Milano'],
        defaultValue: 'Roma'
      } as never
    ]);

    expect(state.comune).toEqual({ label: 'Roma', value: 'Roma' });
  });

  it('keeps unselected dynamic selects empty instead of raw strings', () => {
    const state = BuildFormState([
      {
        name: 'comune',
        htmlRender: RenderType.DYNAMIC_SELECT,
        defaultValue: undefined
      } as never
    ]);

    expect(state.comune).toBeNull();
  });
});
