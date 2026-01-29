/* eslint-disable @typescript-eslint/no-explicit-any */
import dayjs from 'dayjs';
import utils from 'utils';

const originalLocation = window.location;

describe('URL Hash Parameters Utility', () => {
  beforeEach(() => {
    // Mock window.location
    delete (window as any).location;
    (window as any).location = {
      ...originalLocation,
      hash: ''
    };
  });

  afterEach(() => {
    // Restore original location and spies
    window.location = originalLocation as string & Location;
    vi.restoreAllMocks();
  });

  describe('sanitizeChars', () => {
    it('removes disallowed characters, keeping letters, digits, dots and underscores', () => {
      const dirty = 'hello!@#world.123_456';
      const clean = utils.URI.sanitizeChars(dirty);
      expect(clean).toBe('helloworld.123_456');
    });

    it('removes spaces and special characters', () => {
      expect(utils.URI.sanitizeChars('test value')).toBe('testvalue');
      expect(utils.URI.sanitizeChars('foo-bar')).toBe('foobar');
      expect(utils.URI.sanitizeChars('a$b%c^d&e')).toBe('abcde');
    });
  });

  describe('decode', () => {
    it('parses simple string params and sanitizes them', () => {
      window.location.hash = '#foo=bar&baz=qux';
      const result = utils.URI.decode(window.location.hash);
      expect(result).toEqual({ foo: 'bar', baz: 'qux' });
    });

    it('sanitizes keys and values', () => {
      window.location.hash = '#foo!@#=bar$%^&test*()=value';
      const result = utils.URI.decode(window.location.hash);
      expect(result).toEqual({ foo: 'bar', test: 'value' });
    });

    it('handles nested object notation with dots', () => {
      window.location.hash = '#user.name=John&user.age=30';
      const result = utils.URI.decode(window.location.hash);
      expect(result).toEqual({
        user: {
          name: 'John',
          age: '30'
        }
      });
    });

    it('returns empty object for empty hash', () => {
      window.location.hash = '';
      const result = utils.URI.decode(window.location.hash);
      expect(result).toEqual({});
    });
  });

  describe('encode', () => {
    it('encodes simple object into query string', () => {
      const input = { a: 'hello', b: 'world' };
      const result = utils.URI.encode(input);
      expect(result).toContain('a=hello');
      expect(result).toContain('b=world');
    });

    it('encodes Date objects in YYYY-MM-DD format', () => {
      const input = {
        a: 'hello',
        b: new Date(2025, 10, 10) // 10 Nov 2025, months are 0-based
      };
      const result = utils.URI.encode(input);
      expect(result).toContain('a=hello');
      expect(result).toContain('b=2025-11-10');
    });

    it('encodes dayjs objects in YYYY-MM-DD format', () => {
      const input = {
        date: dayjs('2025-11-10')
      };
      const result = utils.URI.encode(input);
      expect(result).toContain('date=2025-11-10');
    });

    it('encodes date strings in YYYY-MM-DD format', () => {
      const input = {
        date: '2025-11-10'
      };
      const result = utils.URI.encode(input);
      expect(result).toContain('date=2025-11-10');
    });

    it('does not interpret short numeric strings as dates', () => {
      const input = {
        a: '1',
        b: '2',
        c: '123'
      };
      const result = utils.URI.encode(input);
      expect(result).toContain('a=1');
      expect(result).toContain('b=2');
      expect(result).toContain('c=123');
      // Should NOT be converted to dates like 2001-01-01
      expect(result).not.toContain('2001');
    });

    it('handles dates in nested objects', () => {
      const input = {
        user: {
          name: 'John',
          birthdate: new Date(1990, 0, 15)
        }
      };
      const result = utils.URI.encode(input);
      expect(result).toContain('user.name=John');
      expect(result).toContain('user.birthdate=1990-01-15');
    });
    const input = {
      a: undefined,
      b: null,
      '': 'emptyKey',
      c: 'value',
      d: ''
    };
    const result = utils.URI.encode(input);
    expect(result).toContain('c=value');
    expect(result).not.toContain('a=');
    expect(result).not.toContain('b=');
    expect(result).not.toContain('=emptyKey');
    expect(result).not.toContain('d=');
  });

  it('flattens nested objects with dot notation', () => {
    const input = {
      user: {
        name: 'John',
        age: 30
      }
    };
    const result = utils.URI.encode(input);
    expect(result).toContain('user.name=John');
    expect(result).toContain('user.age=30');
  });

  it('handles arrays', () => {
    const input = {
      items: ['a', 'b', 'c']
    };
    const result = utils.URI.encode(input);
    // The flat library handles arrays with indices
    expect(result).toContain('items.0=a');
    expect(result).toContain('items.1=b');
    expect(result).toContain('items.2=c');
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
    expect(encoded).toContain('baz=3');
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
    expect(encoded).toContain('baz=3');
    expect(encoded).not.toContain('bar=2');
  });

  it('handles empty excludeKeys array', () => {
    window.location.hash = '#foo=1&bar=2';
    const encoded = utils.URI.resetUrlParams({
      excludeKeys: [],
      defaults: { baz: '3' }
    });

    expect(encoded).toContain('foo=1');
    expect(encoded).toContain('bar=2');
    expect(encoded).toContain('baz=3');
  });

  it('overrides existing params with defaults', () => {
    window.location.hash = '#foo=old&bar=old';
    const encoded = utils.URI.resetUrlParams({
      excludeKeys: [],
      defaults: { foo: 'new' }
    });

    expect(encoded).toContain('foo=new');
    expect(encoded).not.toContain('foo=old');
    expect(encoded).toContain('bar=old');
  });
});

describe('Integration: encode -> set -> decode', () => {
  it('round-trips data correctly', () => {
    const original = {
      name: 'John',
      age: '30',
      active: 'true'
    };

    const encoded = utils.URI.encode(original);
    utils.URI.set(encoded);
    window.location.hash = `#${encoded}`;

    const decoded = utils.URI.decode(window.location.hash);

    expect(decoded).toEqual(original);
  });

  it('handles nested objects in round-trip', () => {
    const original = {
      user: {
        name: 'Jane',
        email: 'jane@example.com'
      }
    };

    const encoded = utils.URI.encode(original);
    utils.URI.set(encoded);
    window.location.hash = `#${encoded}`;

    const decoded = utils.URI.decode(window.location.hash);

    expect(decoded).toEqual({
      user: {
        name: 'Jane',
        email: 'janeexample.com' // Note: @ gets sanitized
      }
    });
  });
});
