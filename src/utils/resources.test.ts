/* eslint-disable @typescript-eslint/no-explicit-any */
import { getResourceUrl } from './resources';
import appStore from 'store/appStore';
import config from 'utils/config';

vi.mock('store/appStore', () => ({
  default: {
    value: {
      brokerInfo: {
        externalId: 'broker-abc'
      }
    }
  }
}));

vi.mock('utils/config', () => ({
  default: {
    resourcesUrl:
      '/cittadini-legaldocs/{BROKER_EXTERNAL_ID}/{DOCUMENT_TYPE}/{DOC_LANGUAGE}_{DOCUMENT_TYPE}.md'
  }
}));

// Mock window.location.origin for relative path tests
const originalLocation = window.location;

beforeAll(() => {
  Object.defineProperty(window, 'location', {
    value: { ...originalLocation, origin: 'https://dev.p4pa.pagopa.it' },
    writable: true
  });
});

afterAll(() => {
  Object.defineProperty(window, 'location', {
    value: originalLocation,
    writable: true
  });
});

describe('getResourceUrl', () => {
  afterEach(() => {
    (appStore as any).value = { brokerInfo: { externalId: 'broker-abc' } };
    config.resourcesUrl =
      '/cittadini-legaldocs/{BROKER_EXTERNAL_ID}/{DOCUMENT_TYPE}/{DOC_LANGUAGE}_{DOCUMENT_TYPE}.md';
  });

  it('should resolve relative path with origin prepended for tos', () => {
    const result = getResourceUrl('tos');
    expect(result).toBe('https://dev.p4pa.pagopa.it/cittadini-legaldocs/broker-abc/tos/it_tos.md');
  });

  it('should resolve relative path with origin prepended for pp', () => {
    const result = getResourceUrl('pp');
    expect(result).toBe('https://dev.p4pa.pagopa.it/cittadini-legaldocs/broker-abc/pp/it_pp.md');
  });

  it('should extract short language code from locale with hyphen (e.g. it-IT -> it)', () => {
    const result = getResourceUrl('tos', 'it-IT');
    expect(result).toBe('https://dev.p4pa.pagopa.it/cittadini-legaldocs/broker-abc/tos/it_tos.md');
  });

  it('should extract short language code from en-US', () => {
    const result = getResourceUrl('pp', 'en-US');
    expect(result).toBe('https://dev.p4pa.pagopa.it/cittadini-legaldocs/broker-abc/pp/en_pp.md');
  });

  it('should handle short language code directly', () => {
    const result = getResourceUrl('tos', 'en');
    expect(result).toBe('https://dev.p4pa.pagopa.it/cittadini-legaldocs/broker-abc/tos/en_tos.md');
  });

  it('should default language to it', () => {
    const result = getResourceUrl('pp');
    expect(result).toBe('https://dev.p4pa.pagopa.it/cittadini-legaldocs/broker-abc/pp/it_pp.md');
  });

  it('should replace DOCUMENT_TYPE in both occurrences', () => {
    const result = getResourceUrl('tos');
    expect(result).toContain('/tos/');
    expect(result).toContain('_tos.md');
  });

  it('should use empty string when brokerCode is missing', () => {
    (appStore as any).value = { brokerInfo: {} };

    const result = getResourceUrl('tos');
    expect(result).toBe('https://dev.p4pa.pagopa.it/cittadini-legaldocs//tos/it_tos.md');
  });

  it('should use empty string when brokerInfo is null', () => {
    (appStore as any).value = { brokerInfo: null };

    const result = getResourceUrl('pp', 'en');
    expect(result).toBe('https://dev.p4pa.pagopa.it/cittadini-legaldocs//pp/en_pp.md');
  });

  it('should not prepend origin when resourcesUrl is a full URL', () => {
    config.resourcesUrl =
      'https://cdn.example.com/docs/{BROKER_EXTERNAL_ID}/{DOCUMENT_TYPE}/{DOC_LANGUAGE}_{DOCUMENT_TYPE}.md';

    const result = getResourceUrl('tos', 'it');
    expect(result).toBe('https://cdn.example.com/docs/broker-abc/tos/it_tos.md');
    expect(result).not.toContain('dev.p4pa.pagopa.it');
  });
});
