// Italian fiscal code (Codice Fiscale) — supports standard validation and omocodia.
// 16 alphanumeric chars. See P4PU-1452.
export const FISCAL_CODE_REGEX =
  /^(?:[A-Z][AEIOUX][AEIOUX]|[B-DF-HJ-NP-TV-Z]{2}[A-Z]){2}(?:[\dLMNP-V]{2}(?:[A-EHLMPR-T](?:[04LQ][1-9MNP-V]|[15MR][\dLMNP-V]|[26NS][0-8LMNP-U])|[DHPS][37PT][0L]|[ACELMRT][37PT][01LM]|[AC-EHLMPR-T][26NS][9V])|(?:[02468LNQSU][048LQU]|[13579MPRTV][26NS])B[26NS][9V])(?:[A-MZ][1-9MNP-V][\dLMNP-V]{2}|[A-M][0L](?:[1-9MNP-V][\dLMNP-V]|[0L][1-9MNP-V]))[A-Z]$/i;

// VAT number (Partita IVA) / legal entity fiscal code — 11 numeric digits.
export const VAT_NUMBER_REGEX = /^\d{11}$/;

// IUV: 17 digits. NAV (Codice Avviso): 18 digits.
export const IUV_REGEX = /^\d{17}$/;
export const NAV_REGEX = /^\d{18}$/;

export const isValidFiscalCode = (value: string) => FISCAL_CODE_REGEX.test(value.trim());

export const isValidVatNumber = (value: string) => VAT_NUMBER_REGEX.test(value.trim());

export const isValidIuvOrNav = (value: string) => {
  const trimmed = value.trim();
  return IUV_REGEX.test(trimmed) || NAV_REGEX.test(trimmed);
};
