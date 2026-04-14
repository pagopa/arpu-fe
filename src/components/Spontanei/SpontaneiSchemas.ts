import * as z from 'zod';

const getPaymentNoticeInfoSchema = (t: (key: string) => string) =>
  z.object({
    org: z
      .object({
        organizationId: z.number(),
        orgName: z.string(),
        orgFiscalCode: z.string()
      })
      .nullable()
      .refine((org) => org !== null, t('spontanei.form.errors.org')),
    debtType: z
      .object({
        debtPositionTypeOrgId: z.number(),
        organizationId: z.number(),
        code: z.string(),
        description: z.string()
      })
      .nullable()
      .refine((debtType) => debtType !== null, t('spontanei.form.errors.debtType')),
    description: z.string().min(2, t('spontanei.form.errors.description')),
    amount: z.number().min(1, t('spontanei.form.errors.amount')),
    fullName: z.string().min(2, t('spontanei.form.errors.fullName')),
    fiscalCode: z
      .string()
      .min(1, t('spontanei.form.errors.fiscalCode.required'))
      .pipe(
        z
          .string()
          .regex(
            /(^[A-Za-z]{6}[0-9]{2}[A-Za-z]{1}[0-9]{2}[A-Za-z]{1}[0-9]{3}[A-Za-z]{1}$)|(^[0-9]{11}$)|ANONIMO/,
            t('spontanei.form.errors.fiscalCode.invalid')
          )
      ),
    email: z
      .string()
      .min(1, t('spontanei.form.errors.email.required'))
      .pipe(z.string().email(t('spontanei.form.errors.email.invalid')))
  });

export default getPaymentNoticeInfoSchema;
