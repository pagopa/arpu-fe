/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from '__tests__/renderers';
import React from 'react';
import DebtPositionDetail from './';
import utils from 'utils';
import { debtPosition } from './components/__test__/mocks';
import { UseQueryResult } from '@tanstack/react-query';
import { DebtorUnpaidDebtPositionOverviewDTO } from '../../../generated/data-contracts';

vi.mock('react-router-dom', () => ({
  useParams: () => ({
    debtPositionId: '1',
    organizationId: '2'
  })
}));

vi.mock('react-helmet', () => ({
  Helmet: ({ children }: any) => <div data-testid="helmet">{children}</div>
}));

describe('DebtPositionDetail', async () => {
  it('renders as expected without crashing', () => {
    vi.spyOn(utils.storage.app, 'getBrokerId').mockReturnValue(3);

    const spyGetDebtPositionDetail = vi
      .spyOn(utils.loaders, 'getDebtPositionDetail')
      .mockReturnValue({ data: debtPosition, isSuccess: true, isLoading: false } as UseQueryResult<
        DebtorUnpaidDebtPositionOverviewDTO,
        Error
      >);

    render(<DebtPositionDetail />);

    expect(spyGetDebtPositionDetail).toBeCalledWith(3, 1, 2);

    const title = screen.getByTestId('debt-position-detail-title').innerHTML;
    expect(title).toContain('debtPositionTypeOrgDescription test description');

    const orgName = screen.getByTestId('debt-position-detail-org-name').innerHTML;
    expect(orgName).toContain('OrgName test');

    const orgCode = screen.getByTestId('debt-position-detail-org-code').innerHTML;
    expect(orgCode).toContain('ABC123');

    const iupd = screen.getByTestId('debt-position-detail-iupd').innerHTML;
    expect(iupd).toContain('123456');
  });

  it('renders dynamic page title', () => {
    vi.spyOn(utils.storage.app, 'getBrokerId').mockReturnValue(3);
    vi.spyOn(utils.loaders, 'getDebtPositionDetail').mockReturnValue({
      data: debtPosition,
      isSuccess: true,
      isLoading: false
    } as any);

    render(<DebtPositionDetail />);
    const title = screen.getByTestId('helmet').querySelector('title');
    expect(title?.textContent).toContain('debtPositionTypeOrgDescription test description');
  });
});
