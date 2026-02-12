import { AxiosResponse } from 'axios';
import { appSetup } from './setup';
import utils from 'utils';

describe('setup', () => {
  it('excetutes setup rutine correctly returning true', async () => {
    vi.spyOn(utils.apiClient.public, 'getPublicBrokerInfo').mockResolvedValue({
      data: { brokerFiscalCode: '', brokerName: '' }
    } as AxiosResponse);
    expect(await appSetup()).toBe(true);
  });

  it('catch correctly an error returning false', async () => {
    vi.spyOn(utils.apiClient.public, 'getPublicBrokerInfo').mockRejectedValue(new Error('error'));
    expect(await appSetup()).toBe(false);
  });
});
