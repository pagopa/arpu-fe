import React, { createContext, useCallback, useContext, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import config from 'utils/config';

const RECAPTCHA_SITE_KEY = config.recaptchaSiteKey;

window.recaptchaOptions = {
  useRecaptchaNet: true,
  enterprise: config.env === 'UAT' || config.env === 'PROD'
};

interface RecaptchaContextType {
  executeRecaptcha: (action?: string) => Promise<string | null>;
  isEnabled: boolean;
}

const RecaptchaContext = createContext<RecaptchaContextType>({
  executeRecaptcha: async () => null,
  isEnabled: false
});

export const useRecaptcha = () => useContext(RecaptchaContext);

export const isRecaptchaEnabled = (): boolean => Boolean(RECAPTCHA_SITE_KEY);

interface RecaptchaProviderProps {
  children: React.ReactNode;
}

export const RecaptchaProvider: React.FC<RecaptchaProviderProps> = ({ children }) => {
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const resolveRef = useRef<((token: string | null) => void) | null>(null);

  const handleChange = useCallback((token: string | null) => {
    if (resolveRef.current) {
      resolveRef.current(token);
      resolveRef.current = null;
    }
    recaptchaRef.current?.reset();
  }, []);

  const handleExpired = useCallback(() => {
    if (resolveRef.current) {
      resolveRef.current(null);
      resolveRef.current = null;
    }
  }, []);

  const handleError = useCallback(() => {
    if (resolveRef.current) {
      resolveRef.current(null);
      resolveRef.current = null;
    }
  }, []);

  const executeRecaptcha = useCallback(async (): Promise<string | null> => {
    if (!isRecaptchaEnabled() || !recaptchaRef.current) {
      return null;
    }

    return new Promise<string | null>((resolve) => {
      resolveRef.current = resolve;
      recaptchaRef.current?.execute();
    });
  }, []);

  const value: RecaptchaContextType = {
    executeRecaptcha,
    isEnabled: isRecaptchaEnabled()
  };

  return (
    <RecaptchaContext.Provider value={value}>
      {children}
      {isRecaptchaEnabled() && (
        <ReCAPTCHA
          ref={recaptchaRef}
          sitekey={RECAPTCHA_SITE_KEY}
          size="invisible"
          onChange={handleChange}
          onExpired={handleExpired}
          onErrored={handleError}
        />
      )}
    </RecaptchaContext.Provider>
  );
};
