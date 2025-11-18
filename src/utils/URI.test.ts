/* eslint-disable @typescript-eslint/no-explicit-any */
import { format } from 'date-fns';
import utils from 'utils';

describe('URL Hash Parameters Utility', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    // Mock window.location and history methods for testing
    delete (window as any).location;
    (window as any).location = {
      ...originalLocation,
      hash: ''
    };
    vi.spyOn(window.history, 'replaceState');
    vi.spyOn(window.history, 'pushState');
    vi.spyOn(window, 'dispatchEvent');
  });

  afterEach(() => {
    // Restore original location and spies
    window.location = originalLocation as string & Location;
    vi.restoreAllMocks();
  });

  describe('sanitizeKeyChars', () => {
    it('removes disallowed characters', () => {
      const dirty = 'hello!@#world.123_456';
      const clean = utils.URI.sanitizeKeyChars(dirty);
      expect(clean).toBe('helloworld.123_456');
    });
  });

  describe('decode', () => {
    it('parses simple string params', () => {
      window.location.hash = '#foo=bar&baz=qux';
      const result = utils.URI.decode(window.location.hash);
      expect(result).toEqual({ foo: 'bar', baz: 'qux' });
    });

    it('parses dates in dd-MM-yyyy format', () => {
      window.location.hash = '#start=10-11-2025';
      const result = utils.URI.decode(window.location.hash);
      expect(result.start).toBeInstanceOf(Date);
      expect(format(result.start as Date, 'dd-MM-yyyy')).toBe('10-11-2025');
    });

    it('applies endOfDay to keys ending with "to"', () => {
      window.location.hash = '#dateTo=10-11-2025';
      const result = utils.URI.decode(window.location.hash);
      expect(result.dateTo).toBeInstanceOf(Date);
      const date = result.dateTo as Date;
      expect(date.getHours()).toBe(23);
      expect(date.getMinutes()).toBe(59);
      expect(date.getSeconds()).toBe(59);
    });
  });

  describe('encode', () => {
    it('encodes object into query string with date formatting', () => {
      const input = {
        a: 'hello',
        b: new Date(2025, 10, 10) // 10 Nov 2025, months are 0-based
      };
      const result = utils.URI.encode(input);
      expect(result).toMatch(/a=hello/);
      expect(result).toMatch(/b=10-11-2025/);
    });

    it('ignores undefined or empty keys', () => {
      const input = {
        a: undefined,
        '': 'emptyKey',
        b: 'value'
      };
      const result = utils.URI.encode(input);
      expect(result).toContain('b=value');
      expect(result).not.toContain('a=');
      expect(result).not.toContain('=emptyKey');
    });
  });

  describe('resetUrlParams', () => {
    it('removes excluded keys and applies defaults', () => {
      window.location.hash = '#foo=1&bar=2&baz=3';
      const encoded = utils.URI.resetUrlParams({
        excludeKeys: ['bar'],
        defaults: { bar: 'default', qux: '4' }
      });
      expect(encoded).toContain('foo=1');
      expect(encoded).toContain('bar=default');
      expect(encoded).toContain('qux=4');
      expect(encoded).not.toContain('bar=2');
    });

    it('works with sourceParams instead of window hash', () => {
      const encoded = utils.URI.resetUrlParams({
        excludeKeys: ['bar'],
        defaults: { bar: 'default', qux: '4' },
        sourceParams: { foo: '1', bar: '2', baz: '3' }
      });
      expect(encoded).toContain('foo=1');
      expect(encoded).toContain('bar=default');
      expect(encoded).toContain('qux=4');
    });
  });
});
