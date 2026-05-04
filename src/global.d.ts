declare module '*.png';

interface Window {
  recaptchaOptions?: {
    useRecaptchaNet?: boolean;
    enterprise?: boolean;
  };
}
