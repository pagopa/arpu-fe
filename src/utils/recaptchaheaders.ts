export const buildRecaptchaHeaders = (token: string | null | undefined): Record<string, string> => {
  if (!token) return {};
  return { 'X-recaptcha-token': token };
};
