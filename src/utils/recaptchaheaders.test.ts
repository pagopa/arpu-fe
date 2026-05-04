import { describe, it, expect } from 'vitest';
import { buildRecaptchaHeaders } from './recaptchaheaders';

describe('buildRecaptchaHeaders', () => {
  it('returns the X-recaptcha-token header when a valid token is provided', () => {
    expect(buildRecaptchaHeaders('abc-token-123')).toEqual({
      'X-recaptcha-token': 'abc-token-123'
    });
  });

  it('returns an empty object when token is null', () => {
    expect(buildRecaptchaHeaders(null)).toEqual({});
  });

  it('returns an empty object when token is undefined', () => {
    expect(buildRecaptchaHeaders(undefined)).toEqual({});
  });

  it('returns an empty object when token is an empty string', () => {
    expect(buildRecaptchaHeaders('')).toEqual({});
  });
});
