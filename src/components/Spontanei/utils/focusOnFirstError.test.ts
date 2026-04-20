import { describe, it, expect, vi, beforeEach } from 'vitest';
import focusOnFirstError from './focusOnFirstError';

describe('focusOnFirstError', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('Focus on the first element', () => {
    const input1 = document.createElement('input');
    input1.id = 'email';
    const input2 = document.createElement('input');
    input2.id = 'password';

    document.body.appendChild(input1);
    document.body.appendChild(input2);

    const focusSpy = vi.spyOn(input1, 'focus');

    focusOnFirstError({
      email: 'Email non valida',
      password: 'Password richiesta'
    });

    expect(focusSpy).toHaveBeenCalledTimes(1);
  });

  it('Focus on the first element also if there are many', () => {
    const input1 = document.createElement('input');
    input1.id = 'first';
    const input2 = document.createElement('input');
    input2.id = 'second';

    document.body.appendChild(input1);
    document.body.appendChild(input2);

    const focusSpy1 = vi.spyOn(input1, 'focus');
    const focusSpy2 = vi.spyOn(input2, 'focus');

    focusOnFirstError({
      first: 'Errore 1',
      second: 'Errore 2'
    });

    expect(focusSpy1).toHaveBeenCalled();
    expect(focusSpy2).not.toHaveBeenCalled();
  });

  it('Does nothing', () => {
    const getElementSpy = vi.spyOn(document, 'getElementById');

    focusOnFirstError({
      missing: 'Errore'
    });

    expect(getElementSpy).toHaveBeenCalledWith('missing');
    // nessun errore lanciato
  });

  it('Does nothing if errors is empty', () => {
    const getElementSpy = vi.spyOn(document, 'getElementById');

    focusOnFirstError({});

    expect(getElementSpy).not.toHaveBeenCalled();
  });

  it('Does nothing if element is null', () => {
    vi.spyOn(document, 'getElementById').mockReturnValue(null);

    const focusMock = vi.fn();

    focusOnFirstError({
      test: 'Errore'
    });

    expect(focusMock).not.toHaveBeenCalled();
  });
});
