import '@testing-library/jest-dom';
import utils from '.';
import { NoticeDetailsDTO } from '../../generated/apiClient';

describe('toEuro function', () => {
  it('should format correctly', () => {
    expect(utils.converters.toEuro(50)).toEqual('0,50\xa0€');

    expect(utils.converters.toEuro(501)).toEqual('5,01\xa0€');

    expect(utils.converters.toEuro(0)).toEqual('0,00\xa0€');

    expect(utils.converters.toEuro(0, 2)).toEqual('0,00\xa0€');

    expect(utils.converters.toEuro(550)).toEqual('5,50\xa0€');

    expect(utils.converters.toEuro(550, 2)).toEqual('5,50\xa0€');

    expect(utils.converters.toEuro(55.67, 2, 3)).toEqual('0,557\xa0€');

    expect(utils.converters.toEuro(55.67, 2)).toEqual('0,56\xa0€');

    expect(utils.converters.toEuro(127, 2, 3)).toEqual('1,270\xa0€');

    expect(utils.converters.toEuro(1, 0)).toEqual('1,00\xa0€');

    expect(utils.converters.toEuro(-55)).toEqual('-0,55\xa0€');

    expect(utils.converters.toEuro(-5, 0)).toEqual('-5,00\xa0€');
  });
});

describe('return a NoticeDetail object', () => {
  it('should return a notice detail object', () => {
    const resp: NoticeDetailsDTO = {
      infoNotice: {
        eventId: 'string',
        authCode: 'string',
        rrn: 'string',
        noticeDate: new Date().toISOString(),
        pspName: 'string',
        walletInfo: { accountHolder: 'string', brand: 'string', blurredNumber: 'string' },
        paymentMethod: 'BBT',
        payer: { name: 'string', taxCode: 'string' },
        amount: 1000,
        fee: 100,
        totalAmount: 1100,
        origin: 'INTERNAL'
      },
      carts: [
        {
          subject: 'string',
          amount: 10000,
          payee: { name: 'string', taxCode: 'string' },
          debtor: { name: 'string', taxCode: 'string' },
          refNumberValue: 'string',
          refNumberType: 'string'
        }
      ]
    };

    expect(utils.converters.prepareNoticeDetailData(resp)).toHaveProperty('eventId');
  });
});

describe('withMissingValue hoc', () => {
  const { toEuro, withMissingValue } = utils.converters;
  const { missingValue } = utils.config;

  const toEuroWithMissingValue = withMissingValue(toEuro);
  it('should return the global missing value character', () => {
    expect(toEuroWithMissingValue(undefined)).toEqual(missingValue);
    expect(toEuroWithMissingValue(undefined, 2)).toEqual(missingValue);
  });

  it('should return a custom value #', () => {
    const toEuroWithMissingValue = withMissingValue(toEuro, '#');
    expect(toEuroWithMissingValue(undefined)).toEqual('#');
  });

  it('should return a proper value', () => {
    expect(toEuroWithMissingValue(50)).toEqual('0,50\xa0€');
  });
});

describe('capitalizeFirstLetter function', () => {
  it('should convert correctly', () => {
    expect(utils.converters.capitalizeFirstLetter('marco')).toEqual('Marco');
    expect(utils.converters.capitalizeFirstLetter('marco polo')).toEqual('Marco Polo');
    expect(utils.converters.capitalizeFirstLetter('MARCO')).toEqual('Marco');
    expect(utils.converters.capitalizeFirstLetter('MARCO POLO')).toEqual('Marco Polo');

    expect(utils.converters.capitalizeFirstLetter('Marco polo')).toEqual('Marco Polo');
    expect(utils.converters.capitalizeFirstLetter('mArCo')).toEqual('Marco');
    expect(utils.converters.capitalizeFirstLetter('MarCo pOlO')).toEqual('Marco Polo');

    expect(utils.converters.capitalizeFirstLetter(undefined)).toEqual(utils.config.missingValue);
  });
});

describe('extractFilename function', () => {
  it('should convert correctly', () => {
    expect(
      utils.converters.extractFilename("attachment; filename='99999999982_01000000020909069.pdf'")
    ).toEqual('99999999982_01000000020909069.pdf');
    expect(utils.converters.extractFilename('')).toEqual(null);
    expect(utils.converters.extractFilename('wrong string')).toEqual(null);
  });
});
