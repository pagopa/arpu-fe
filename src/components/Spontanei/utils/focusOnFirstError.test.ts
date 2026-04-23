import { describe, it, expect, vi, beforeEach } from 'vitest';
import focusOnFirstError from './focusOnFirstError';

describe('focusOnFirstError', () => {
  beforeEach(() => {
    // Clear the document body before each test
    document.body.innerHTML = '';
  });

  it('should do nothing if errors object is empty', () => {
    document.body.innerHTML = '<input name="email" id="email" />';
    const focusSpy = vi.spyOn(window.HTMLElement.prototype, 'focus');

    focusOnFirstError({});

    expect(focusSpy).not.toHaveBeenCalled();
  });

  it('should focus the first invalid element based on DOM order, not key order', () => {
    // Setup: 'lastName' is physically first in DOM, but 'firstName' is first in the object
    document.body.innerHTML = `
      <form>
        <input name="lastName" id="lastName" />
        <input name="firstName" id="firstName" />
      </form>
    `;

    const lastNameInput = document.getElementsByName('lastName')[0];
    const firstNameInput = document.getElementsByName('firstName')[0];

    const lastNameSpy = vi.spyOn(lastNameInput, 'focus');
    const firstNameSpy = vi.spyOn(firstNameInput, 'focus');

    // Object keys: firstName comes first
    const errors = {
      firstName: 'First name is required',
      lastName: 'Last name is required'
    };

    focusOnFirstError(errors);

    // Should have focused lastName because it appears first in the HTML
    expect(lastNameSpy).toHaveBeenCalled();
    expect(firstNameSpy).not.toHaveBeenCalled();
  });

  it('should find element by ID if name attribute is missing', () => {
    document.body.innerHTML = '<input id="uniqueId" />';
    const input = document.getElementById('uniqueId');
    const focusSpy = vi.spyOn(input!, 'focus');

    focusOnFirstError({ uniqueId: 'Error message' });

    expect(focusSpy).toHaveBeenCalled();
  });

  it('should support various input types including select and textarea', () => {
    document.body.innerHTML = `
      <textarea name="description"></textarea>
      <select name="country"><option value="IT">Italy</option></select>
    `;

    const textarea = document.getElementsByName('description')[0];
    const focusSpy = vi.spyOn(textarea, 'focus');

    focusOnFirstError({ description: 'Too short' });

    expect(focusSpy).toHaveBeenCalled();
  });
});
