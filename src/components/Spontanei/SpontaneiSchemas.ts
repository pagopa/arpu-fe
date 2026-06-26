import * as z from 'zod';
import { FISCAL_CODE_REGEX } from 'utils/validators';

// Reuse the shared CF regex, allowing the ANONIMO placeholder used by spontanei.
const FISCAL_CODE_OR_ANONIMO_REGEX = new RegExp(`${FISCAL_CODE_REGEX.source}|^ANONIMO$`, 'i');

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
        z.string().regex(FISCAL_CODE_OR_ANONIMO_REGEX, 'spontanei.form.errors.fiscalCode.invalid')
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
