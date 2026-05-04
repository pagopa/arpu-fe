import { AxiosResponse } from 'axios';
import { appSetup } from './setup';
import utils from 'utils';
import { parseBrokerConfig } from './brokerconfig';
import { setAppReady, setBrokerInfo } from 'store/appStore';
import { OUTCOMES, ROUTES } from 'routes/routes';

vi.mock('./brokerconfig', () => ({
  parseBrokerConfig: vi.fn((config) => config || { translation: {} }),
  applyBrokerTranslations: vi.fn()
}));

vi.mock('./config', () => ({
  default: {
    brokerCode: 'BROKER_CODE'
  }
}));

vi.mock('store/appStore', () => ({ setAppReady: vi.fn(), setBrokerInfo: vi.fn() }));

const mockReplace = vi.fn();

beforeAll(() => {
  Object.defineProperty(window, 'location', {
    writable: true,
    value: { ...window.location, replace: mockReplace, href: 'http://localhost/' }
  });
});

describe('setup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.location.href = 'http://localhost/';
  });

  it('executes setup routine correctly returning true', async () => {
    const mockData = {
      brokerFiscalCode: '',
      brokerName: '',
      config: { useCart: true, translation: {} }
    };
    vi.spyOn(utils.apiClient.public, 'getPublicBrokerInfo').mockResolvedValue({
      data: mockData
    } as AxiosResponse);

    expect(await appSetup()).toBe(true);
  });

  it('calls parseBrokerConfig with data.config on success', async () => {
    const mockConfig = { someKey: 'someValue' };
    vi.spyOn(utils.apiClient.public, 'getPublicBrokerInfo').mockResolvedValue({
      data: { brokerFiscalCode: '', brokerName: '', config: mockConfig }
    } as AxiosResponse);

    await appSetup();

    expect(parseBrokerConfig).toHaveBeenCalledWith(mockConfig);
  });

  it('calls setBrokerInfo with response data on success', async () => {
    const mockData = { brokerFiscalCode: 'ABC', brokerName: 'Test Broker' };
    vi.spyOn(utils.apiClient.public, 'getPublicBrokerInfo').mockResolvedValue({
      data: mockData
    } as AxiosResponse);

    await appSetup();

    // setup.tsx persists both broker info and brokerCode
    expect(setBrokerInfo).toHaveBeenCalledWith(
      expect.objectContaining({ ...mockData, config: expect.anything() }),
      'BROKER_CODE'
    );
  });

  it('always calls setAppReady in the finally block on success', async () => {
    vi.spyOn(utils.apiClient.public, 'getPublicBrokerInfo').mockResolvedValue({
      data: {}
    } as AxiosResponse);

    await appSetup();

    expect(setAppReady).toHaveBeenCalledTimes(1);
  });

  it('always calls setAppReady in the finally block on error', async () => {
    vi.spyOn(utils.apiClient.public, 'getPublicBrokerInfo').mockRejectedValue(new Error('error'));

    await appSetup();

    expect(setAppReady).toHaveBeenCalledTimes(1);
  });

  it('catches an error, redirects to courtesy page, and returns false', async () => {
    vi.spyOn(utils.apiClient.public, 'getPublicBrokerInfo').mockRejectedValue(new Error('error'));
    const clearBrokerInfoSpy = vi.spyOn(utils.storage.app, 'clearBrokerInfo');

    expect(await appSetup()).toBe(false);

    const expectedUrl = ROUTES.public.COURTESY_PAGE.replace(':outcome', OUTCOMES[410]);
    expect(clearBrokerInfoSpy).toHaveBeenCalledTimes(1);
    expect(mockReplace).toHaveBeenCalledWith(expectedUrl);
  });

  it('skips stateSetup and returns false when URL includes the 410 error path', async () => {
    window.location.href = `http://localhost/${OUTCOMES[410]}`;
    const apiSpy = vi.spyOn(utils.apiClient.public, 'getPublicBrokerInfo');

    expect(await appSetup()).toBe(false);
    expect(apiSpy).not.toHaveBeenCalled();
  });
});
