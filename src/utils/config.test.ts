describe('Configuration Tests', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
    vi.resetModules();
    vi.clearAllMocks();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should load configuration with valid environment variables', async () => {
    process.env.APIHOST = 'http://localhost:1234/api';
    process.env.CHECKOUT_HOST = 'https://dev.checkout.pagopa.it';
    process.env.LOGIN_URL = 'https://api.dev.cittadini-p4pa.pagopa.it/arc/v1/login/oneidentity';
    process.env.CHECKOUT_PLATFORM_URL = 'https://api.dev.platform.pagopa.it/checkout/ec/v1';
    process.env.DEPLOY_PATH = '/cittadini';
    process.env.VERSION = '1.0.0';
    process.env.RESOURCES_URL =
      '/cittadini-legaldocs/{BROKER_EXTERNAL_ID}/{DOCUMENT_TYPE}/{DOC_LANGUAGE}_{DOCUMENT_TYPE}.md';
    process.env.RECAPTCHA_SITE_KEY = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';

    const reloadedConfig = (await import('./config')).default;

    expect(reloadedConfig.baseURL).toBe(process.env.APIHOST);
    expect(reloadedConfig.checkoutHost).toBe(process.env.CHECKOUT_HOST);
    expect(reloadedConfig.loginUrl).toBe(process.env.LOGIN_URL);
    expect(reloadedConfig.checkoutPlatformUrl).toBe(process.env.CHECKOUT_PLATFORM_URL);
    expect(reloadedConfig.deployPath).toBe(process.env.DEPLOY_PATH);
    expect(reloadedConfig.version).toBe('1.0.0');
    expect(reloadedConfig.resourcesUrl).toBe(process.env.RESOURCES_URL);
    expect(reloadedConfig.recaptchaSiteKey).toBe('6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI');
  });

  it('should throw validation error for invalid URL in APIHOST', async () => {
    process.env.APIHOST = 'invalid-url';
    process.env.ENV = 'DEV';

    const logSpy = vi.spyOn(console, 'error');
    await import('./config');
    expect(logSpy).toHaveBeenCalledWith(
      'ENV variables validation failed',
      expect.arrayContaining([
        expect.objectContaining({
          message: 'Invalid url'
        })
      ])
    );
  });

  it('should fail when missing required environment variables', async () => {
    delete process.env.APIHOST;

    const logSpy = vi.spyOn(console, 'error');
    await import('./config');
    expect(logSpy).toHaveBeenCalledWith(
      'ENV variables validation failed',
      expect.arrayContaining([
        expect.objectContaining({
          message: 'Required'
        })
      ])
    );
  });

  it('should use default RESOURCES_URL when env variable is not set', async () => {
    delete process.env.RESOURCES_URL;

    const reloadedConfig = (await import('./config')).default;

    expect(reloadedConfig.resourcesUrl).toBe(
      '/cittadini-legaldocs/{BROKER_EXTERNAL_ID}/{DOCUMENT_TYPE}/{DOC_LANGUAGE}_{DOCUMENT_TYPE}.md'
    );
  });

  it('should expose recaptchaSiteKey from environment variable', async () => {
    process.env.RECAPTCHA_SITE_KEY = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';

    const reloadedConfig = (await import('./config')).default;

    expect(reloadedConfig.recaptchaSiteKey).toBe('6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI');
  });

  it('should default recaptchaSiteKey to empty string when not set', async () => {
    delete process.env.RECAPTCHA_SITE_KEY;

    const reloadedConfig = (await import('./config')).default;

    expect(reloadedConfig.recaptchaSiteKey).toBe('');
  });

  it('should pass validation when RECAPTCHA_SITE_KEY is not set (optional)', async () => {
    delete process.env.RECAPTCHA_SITE_KEY;

    const logSpy = vi.spyOn(console, 'error');
    await import('./config');

    if (logSpy.mock.calls.length > 0) {
      const validationIssues = logSpy.mock.calls[0][1] as Array<{ path: string[] }>;
      const hasRecaptchaError = validationIssues?.some?.((issue) =>
        JSON.stringify(issue).includes('RECAPTCHA')
      );
      expect(hasRecaptchaError).toBeFalsy();
    }
  });
});
