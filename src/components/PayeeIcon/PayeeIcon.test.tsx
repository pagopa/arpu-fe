import '@testing-library/jest-dom';
import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import { PayeeIcon } from './index';

vi.mock('utils/storage', () => ({
  default: {
    app: {
      getBrokerId: vi.fn(() => 123)
    }
  }
}));

vi.mock('utils/loaders', () => ({
  default: {
    public: {
      getPublicOrganizationLogo: vi.fn(() => ({
        data: { orgLogo: 'https://assets.cdn.io.italia.it/logos/organizations/80078750587.png' }
      }))
    }
  }
}));

describe('Payeeicon component', () => {
  it('should render with a fallback image', () => {
    const payeeComponent = render(
      <PayeeIcon alt="Logo EC" orgFiscalCode="123456789" visible={true} />
    );
    const payeeComponentImg = payeeComponent.getByTestId('payeelogoimg');
    fireEvent.error(payeeComponentImg);

    expect(payeeComponentImg).toHaveAttribute('src', '/cittadini/images/fallback-ec.png');
  });

  it('should render with an EC image', () => {
    const LOGO_URL = 'https://assets.cdn.io.italia.it/logos/organizations/80078750587.png';
    const payeeComponent = render(<PayeeIcon alt="Logo INPS" orgFiscalCode="123456789" visible={true} />);
    const payeeComponentImg = payeeComponent.getByTestId('payeelogoimg');
    fireEvent.load(payeeComponentImg);

    expect(payeeComponentImg).toHaveAttribute('src', LOGO_URL);
  });
});
