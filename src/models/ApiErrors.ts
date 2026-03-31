import axios, { AxiosError } from 'axios';

export interface ApiErrorResponse {
  category?: string;
  message?: string;
  code?: string;
}

export const isApiAxiosError = (error: unknown): error is AxiosError<ApiErrorResponse> =>
  axios.isAxiosError<ApiErrorResponse>(error);

export const isRecaptchaError = (error: unknown): boolean =>
  isApiAxiosError(error) && error.response?.data?.code === 'MISSING_RECAPTCHA_HEADER';
