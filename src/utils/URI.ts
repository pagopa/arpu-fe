import dayjs from 'dayjs';
import { unflatten, flatten } from 'flat';
import queryString from 'query-string';

function sanitizeChars(input: string): string {
  // Allows letters, digits and literal dot and _
  return input.replace(/[^a-zA-Z0-9._,]/g, '');
}

function encodeValue(value: unknown): string {
  // Only format as date if it's already a date string in the correct format
  // Avoid interpreting short numeric strings as dates
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }
  return String(value);
}

function decode(fragment: string): Record<string, string> {
  const parsed = queryString.parse(fragment) as Record<string, string>;
  const flatObj: Record<string, string> = {};
  Object.entries(parsed).forEach(([key, value]) => {
    const sanitizedKey = sanitizeChars(key);
    const sanitizedValue = sanitizeChars(value);
    flatObj[sanitizedKey] = sanitizedValue;
  });
  return unflatten(flatObj);
}

/**
 * Recursively converts Date and dayjs objects to YYYY-MM-DD strings
 * This prevents the flatten library from breaking them into internal properties
 */
function preprocessDates(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  Object.entries(obj).forEach(([key, value]) => {
    if (dayjs.isDayjs(value)) {
      result[key] = value.format('YYYY-MM-DD');
    } else if (value instanceof Date) {
      result[key] = dayjs(value).format('YYYY-MM-DD');
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      // Recursively process nested objects
      result[key] = preprocessDates(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  });

  return result;
}

export function encode<T extends Record<string, unknown>>(obj: T): string {
  // Preprocess dates before flattening to avoid them being broken down
  const preprocessed = preprocessDates(obj);

  // Flatten the object to dot-notation keys
  const flattened = flatten(preprocessed) as Record<string, unknown>;
  const flatStrings: Record<string, string> = {};

  // Convert all values to strings
  Object.entries(flattened).forEach(([key, value]) => {
    if (value && key) {
      flatStrings[key] = encodeValue(value);
    }
  });

  return queryString.stringify(flatStrings);
}

/**
 * Set or update the window's URL fragment parameters without reload.
 */
const set = (params: string, opts?: { replace?: boolean }) => {
  if (opts?.replace) {
    window.history.replaceState({}, '', `#${params}`);
  } else {
    window.history.pushState({}, '', `#${params}`);
  }
  window.dispatchEvent(new Event('hashchangeCustom'));
};

type ResetUrlParamsOptions = {
  excludeKeys: Array<string>;
  defaults?: Record<string, unknown>;
  sourceParams?: Record<string, unknown>;
};

/**
 * Reset URL hash parameters by filtering out specified keys and applying defaults.
 */
const resetUrlParams = (options: ResetUrlParamsOptions): string => {
  const { excludeKeys, defaults = {}, sourceParams } = options;
  const currentParams = sourceParams || decode(window.location.hash);
  const filteredParams = Object.fromEntries(
    Object.entries(currentParams).filter(([key]) => !excludeKeys.includes(key))
  );
  const finalParams = {
    ...filteredParams,
    ...defaults
  };
  const encoded = encode(finalParams);
  set(encoded);
  return encoded;
};

export default {
  decode,
  encode,
  set,
  resetUrlParams,
  sanitizeChars
};
