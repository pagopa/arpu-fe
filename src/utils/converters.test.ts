import utils from 'utils';
import { CartItem } from 'models/Cart';
import {
  capitalizeFirstLetter,
  formatDateOrMissingValue,
  fromTaxCodeToSrcImage,
  propertyOrMissingValue,
  toEuroOrMissingValue
} from './converters';
import { PaymentNoticeEnum } from 'models/PaymentNotice';
import { DateFormat } from './datetools';

const MISSING = utils.config.missingValue;

describe('utils.converters.cartItemsToCartsRequest - allCCP aggregation', () => {
  beforeEach(() => {
    vi.spyOn(utils.storage.user, 'isAnonymous').mockReturnValue(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const baseItem = {
    paFullName: 'PA',
    description: 'desc',
    amount: 100,
    iuv: 'iuv',
    nav: 'nav',
    paTaxCode: 'tax'
  };

  it('sets allCCP=true when all items have allCCP=true', () => {
    const items: CartItem[] = [
      { ...baseItem, iuv: 'iuv-1', nav: 'nav-1', allCCP: true },
      { ...baseItem, iuv: 'iuv-2', nav: 'nav-2', allCCP: true }
    ];

    const request = utils.converters.cartItemsToCartsRequest(items);
    expect(request.allCCP).toBe(true);
  });

  it('sets allCCP=false when all items have allCCP=false', () => {
    const items: CartItem[] = [
      { ...baseItem, iuv: 'iuv-1', nav: 'nav-1', allCCP: false },
      { ...baseItem, iuv: 'iuv-2', nav: 'nav-2', allCCP: false }
    ];

    const request = utils.converters.cartItemsToCartsRequest(items);
    expect(request.allCCP).toBe(false);
  });

  it('sets allCCP=false when items have mixed allCCP values', () => {
    const items: CartItem[] = [
      { ...baseItem, iuv: 'iuv-1', nav: 'nav-1', allCCP: true },
      { ...baseItem, iuv: 'iuv-2', nav: 'nav-2', allCCP: false }
    ];

    const request = utils.converters.cartItemsToCartsRequest(items);
    expect(request.allCCP).toBe(false);
  });
});

describe('utils.converters.cartItemsToCartsRequest - shape', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const items: CartItem[] = [
    {
      paFullName: 'ACI',
      description: 'Bollo',
      amount: 12345,
      iuv: 'IUV-1',
      nav: 'NAV-1',
      paTaxCode: 'TAX-1',
      allCCP: true
    },
    {
      paFullName: 'Comune',
      description: 'TARI',
      amount: 6789,
      iuv: 'IUV-2',
      nav: 'NAV-2',
      paTaxCode: 'TAX-2',
      allCCP: true
    }
  ];

  it('maps cart items to paymentNotices shape', () => {
    vi.spyOn(utils.storage.user, 'isAnonymous').mockReturnValue(false);
    const request = utils.converters.cartItemsToCartsRequest(items);

    expect(request.paymentNotices).toStrictEqual([
      {
        amount: 12345,
        companyName: 'ACI',
        description: 'Bollo',
        fiscalCode: 'TAX-1',
        noticeNumber: 'NAV-1'
      },
      {
        amount: 6789,
        companyName: 'Comune',
        description: 'TARI',
        fiscalCode: 'TAX-2',
        noticeNumber: 'NAV-2'
      }
    ]);
  });

  it('builds authenticated returnUrls when user is not anonymous', () => {
    vi.spyOn(utils.storage.user, 'isAnonymous').mockReturnValue(false);
    const request = utils.converters.cartItemsToCartsRequest(items);

    expect(request.returnUrls.returnCancelUrl).toContain('/posizioni-debitorie');
    expect(request.returnUrls.returnErrorUrl).toContain('/posizioni-debitorie');
    expect(request.returnUrls.returnOkUrl).not.toContain('/public/esito');
    expect(request.returnUrls.returnCancelUrl).not.toContain('/public/esito');
    expect(request.returnUrls.returnErrorUrl).not.toContain('/public/esito');
  });

  it('builds public courtesy returnUrls when user is anonymous', () => {
    vi.spyOn(utils.storage.user, 'isAnonymous').mockReturnValue(true);
    const request = utils.converters.cartItemsToCartsRequest(items);

    expect(request.returnUrls.returnOkUrl).toContain('/public/esito/pagamento-avviso-completato');
    expect(request.returnUrls.returnCancelUrl).toContain('/public/esito/pagamento-annullato');
    expect(request.returnUrls.returnErrorUrl).toContain('/public/esito/pagamento-non-riuscito');
  });

  it('appends the same query params (nav + org_fiscal_code) to all anonymous courtesy URLs', () => {
    vi.spyOn(utils.storage.user, 'isAnonymous').mockReturnValue(true);
    const request = utils.converters.cartItemsToCartsRequest(items);

    const expectedSearch = `?nav=${items[0].nav}&org_fiscal_code=${items[0].paTaxCode}`;

    expect(request.returnUrls.returnOkUrl).toContain(expectedSearch);
    expect(request.returnUrls.returnCancelUrl).toContain(expectedSearch);
    expect(request.returnUrls.returnErrorUrl).toContain(expectedSearch);
  });
});

describe('utils.converters.toEuro', () => {
  const format = (s: string) => s.replace(/\s/g, ' ');

  it('formats cents as euro currency with two decimals', () => {
    expect(format(utils.converters.toEuro(12345))).toBe('123,45 €');
  });

  it('renders zero correctly', () => {
    expect(format(utils.converters.toEuro(0))).toBe('0,00 €');
  });

  it('respects custom decimalDigits', () => {
    expect(format(utils.converters.toEuro(12345, 0))).toBe('12.345,00 €');
  });
});

describe('utils.converters.toEuroOrMissingValue', () => {
  it('formats a valid amount', () => {
    expect(toEuroOrMissingValue(100)).toMatch(/1,00/);
  });

  it('returns missing value when amount is undefined', () => {
    expect(toEuroOrMissingValue(undefined)).toBe(MISSING);
  });
});

describe('utils.converters.propertyOrMissingValue', () => {
  it('returns the property when defined', () => {
    expect(propertyOrMissingValue('hello')).toBe('hello');
  });

  it('returns missing value when undefined', () => {
    expect(propertyOrMissingValue(undefined)).toBe(MISSING);
  });
});

describe('utils.converters.formatDateOrMissingValue', () => {
  it('formats a valid ISO date', () => {
    expect(formatDateOrMissingValue('2024-06-01T00:00:00Z')).toBe('01/06/2024');
  });

  it('returns missing value when date is undefined', () => {
    expect(formatDateOrMissingValue(undefined)).toBe(MISSING);
  });

  it('supports LONG format with time', () => {
    const out = formatDateOrMissingValue('2024-06-01T10:30:00Z', {
      format: DateFormat.LONG,
      withTime: true
    });
    expect(out).toContain('2024');
    const timeMatch = out
      .split(' ')
      .some(
        (token) =>
          token.length === 5 &&
          token[2] === ':' &&
          !Number.isNaN(Number(token.slice(0, 2))) &&
          !Number.isNaN(Number(token.slice(3, 5)))
      );
    expect(timeMatch).toBe(true);
  });
});

describe('utils.converters.fromTaxCodeToSrcImage', () => {
  it('strips leading zeros from tax code and builds CDN url', () => {
    const url = fromTaxCodeToSrcImage('00012345678');
    expect(url).toBe(`${utils.config.entitiesLogoCdn}/12345678.png`);
  });

  it('keeps tax code unchanged when no leading zero', () => {
    const url = fromTaxCodeToSrcImage('12345678');
    expect(url).toBe(`${utils.config.entitiesLogoCdn}/12345678.png`);
  });
});

describe('utils.converters.capitalizeFirstLetter', () => {
  it('capitalizes first letter of every word', () => {
    expect(capitalizeFirstLetter('mario rossi')).toBe('Mario Rossi');
  });

  it('lowercases the rest of each word', () => {
    expect(capitalizeFirstLetter('MARIO ROSSI')).toBe('Mario Rossi');
  });

  it('returns missing value when input is undefined through the wrapped export', () => {
    expect(utils.converters.capitalizeFirstLetter(undefined)).toBe(MISSING);
  });

  it('forwards the value through the wrapped export when defined', () => {
    expect(utils.converters.capitalizeFirstLetter('comune di roma')).toBe('Comune Di Roma');
  });
});

describe('utils.converters.extractFilename', () => {
  it('extracts quoted filename from content-disposition header', () => {
    expect(utils.converters.extractFilename('attachment; filename="invoice.pdf"')).toBe(
      'invoice.pdf'
    );
  });

  it('extracts unquoted filename', () => {
    expect(utils.converters.extractFilename('attachment; filename=invoice.pdf')).toBe(
      'invoice.pdf'
    );
  });

  it('is case-insensitive', () => {
    expect(utils.converters.extractFilename('attachment; FILENAME="a.pdf"')).toBe('a.pdf');
  });

  it('returns null when header has no filename', () => {
    expect(utils.converters.extractFilename('attachment')).toBeNull();
  });
});

describe('utils.converters.withMissingValue', () => {
  it('returns the decorated function result when all args are defined', () => {
    const sum = utils.converters.withMissingValue((a: number, b: number) => a + b);
    expect(sum(2, 3)).toBe(5);
  });

  it('returns the default missing value when any arg is undefined', () => {
    const sum = utils.converters.withMissingValue((a: number, b: number) => a + b);
    expect(sum(2, undefined)).toBe(MISSING);
  });

  it('returns a custom missing value when provided', () => {
    const sum = utils.converters.withMissingValue((a: number, b: number) => a + b, 'N/A');
    expect(sum(undefined, 3)).toBe('N/A');
  });
});

describe('utils.converters.normalizePaymentNotice', () => {
  const baseOption = {
    amount: 12345,
    dueDate: '2024-06-01T00:00:00Z',
    description: 'Option desc',
    installments: [
      {
        amount: 12345,
        dueDate: '2024-06-01T00:00:00Z'
      }
    ]
  };

  it('normalizes a SINGLE payment notice (one option)', () => {
    const notice = {
      paTaxCode: '00012345678',
      paFullName: 'ACI',
      paymentOptions: [baseOption]
    };

    const result = utils.converters.normalizePaymentNotice(notice as never);

    expect(result.type).toBe(PaymentNoticeEnum.SINGLE);
    expect(result.image.src).toContain('/12345678.png');
    expect(result.image.alt).toBe('ACI');
    expect(
      Array.isArray((result.paymentOptions as never as { installments: unknown }).installments)
    ).toBe(false);
  });

  it('normalizes a MULTIPLE payment notice (multiple options)', () => {
    const notice = {
      paTaxCode: '00012345678',
      paFullName: 'ACI',
      paymentOptions: [baseOption, baseOption]
    };

    const result = utils.converters.normalizePaymentNotice(notice as never);

    expect(result.type).toBe(PaymentNoticeEnum.MULTIPLE);
    expect(Array.isArray(result.paymentOptions)).toBe(true);
    expect((result.paymentOptions as unknown[]).length).toBe(2);
  });
});

describe('utils.converters.prepareNoticeDetailData', () => {
  const baseInfoNotice = {
    payer: { name: 'Mario Rossi', taxCode: 'RSSMRA80A01H501U' },
    walletInfo: {
      accountHolder: 'Mario Rossi',
      blurredNumber: '**** 1234',
      brand: 'VISA',
      maskedEmail: 'm***@example.com'
    },
    paymentMethod: 'CP',
    authCode: 'AUTH123',
    eventId: 'EVT1',
    rrn: 'PRN1',
    pspName: 'PSPName',
    noticeDate: '2024-06-01T10:30:00Z',
    amount: 10000,
    fee: 100,
    totalAmount: 10100,
    origin: 'CHECKOUT'
  };

  const baseCart = {
    subject: 'Bollo auto',
    debtor: { name: 'Mario Rossi', taxCode: 'RSSMRA80A01H501U' },
    payee: { name: 'ACI', taxCode: '00012345678' },
    refNumberValue: 'NAV-123'
  };

  it('returns undefined when infoNotice is missing', () => {
    const result = utils.converters.prepareNoticeDetailData({ infoNotice: undefined } as never);
    expect(result).toBeUndefined();
  });

  it('maps all the fields when full data is provided', () => {
    const result = utils.converters.prepareNoticeDetailData({
      infoNotice: baseInfoNotice,
      carts: [baseCart]
    } as never);

    expect(result).toBeDefined();
    expect(result?.payer).toStrictEqual({
      name: 'Mario Rossi',
      taxCode: 'RSSMRA80A01H501U'
    });
    expect(result?.walletInfo).toStrictEqual({
      accountHolder: 'Mario Rossi',
      brand: 'VISA',
      blurredNumber: '**** 1234',
      maskedEmail: 'm***@example.com'
    });
    expect(result?.authCode).toBe('AUTH123');
    expect(result?.PRN).toBe('PRN1');
    expect(result?.PSP).toBe('PSPName');
    expect(result?.subject).toBe('Bollo auto');
    expect(result?.debtor).toBe('Mario Rossi');
    expect(result?.creditorEntity).toBe('ACI');
    expect(result?.noticeCode).toBe('NAV-123');
    expect(result?.status).toBe('SUCCESS');
  });

  it('falls back to missing values when fields are absent', () => {
    const result = utils.converters.prepareNoticeDetailData({
      infoNotice: {
        ...baseInfoNotice,
        payer: undefined,
        walletInfo: undefined,
        authCode: undefined,
        rrn: undefined,
        pspName: undefined
      },
      carts: undefined
    } as never);

    expect(result?.payer).toBeUndefined();
    expect(result?.walletInfo).toBeUndefined();
    expect(result?.authCode).toBe(MISSING);
    expect(result?.PRN).toBe(MISSING);
    expect(result?.PSP).toBe(MISSING);
    expect(result?.debtor).toBe(MISSING);
    expect(result?.creditorEntity).toBe(MISSING);
    expect(result?.noticeCode).toBe(MISSING);
  });
});
