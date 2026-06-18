import * as z from 'zod';

const getPaymentNoticeInfoSchema = () =>
  z.object({
    org: z
      .object({
        organizationId: z.number(),
        orgName: z.string(),
        orgFiscalCode: z.string()
      })
      .nullable()
      .refine((org) => org !== null, 'spontanei.form.errors.org'),
    debtType: z
      .object({
        debtPositionTypeOrgId: z.number(),
        organizationId: z.number(),
        code: z.string(),
        description: z.string()
      })
      .nullable()
      .refine((debtType) => debtType !== null, 'spontanei.form.errors.debtType'),
    description: z.string().min(2, 'spontanei.form.errors.description'),
    amount: z.number().min(1, 'spontanei.form.errors.amount'),
    fullName: z.string().min(2, 'spontanei.form.errors.fullName'),
    fiscalCode: z
      .string()
      .min(1, 'spontanei.form.errors.fiscalCode.required')
      .pipe(
        z
          .string()
          .regex(
            /^(?:[A-Z][AEIOUX][AEIOUX]|[B-DF-HJ-NP-TV-Z]{2}[A-Z]){2}(?:[\dLMNP-V]{2}(?:[A-EHLMPR-T](?:[04LQ][1-9MNP-V]|[15MR][\dLMNP-V]|[26NS][0-8LMNP-U])|[DHPS][37PT][0L]|[ACELMRT][37PT][01LM]|[AC-EHLMPR-T][26NS][9V])|(?:[02468LNQSU][048LQU]|[13579MPRTV][26NS])B[26NS][9V])(?:[A-MZ][1-9MNP-V][\dLMNP-V]{2}|[A-M][0L](?:[1-9MNP-V][\dLMNP-V]|[0L][1-9MNP-V]))[A-Z]$|^ANONIMO$/i,
            'spontanei.form.errors.fiscalCode.invalid'
          )
      ),
    email: z
      .string()
      .min(1, 'spontanei.form.errors.email.required')
      .pipe(z.string().email('spontanei.form.errors.email.invalid'))
  });

export type Option = { label: string; value: string };

export const OptionSchema = z.object({
  label: z.string(),
  value: z.string()
});

export default getPaymentNoticeInfoSchema;
