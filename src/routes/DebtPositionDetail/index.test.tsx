import { render, screen } from '__tests__/renderers';
import React from 'react';
import DebtPositionDetail from './';
import utils from 'utils';
import { debtPosition } from './components/__test__/mocks';
import { Mock } from 'vitest';

vi.mock('utils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('utils')>();
  return {
    ...actual,
    default: {
      ...actual.default,
      storage: {
        ...actual.default.storage,
        app: {
          ...actual.default.storage.app,
          getBrokerId: vi.fn()
        }
      },
      loaders: {
        ...actual.default.loaders,
        getDebtPositionDetail: vi.fn()
      }
    }
  };
});

vi.mock('react-router-dom', () => ({
  useParams: () => ({
    debtPositionId: '1',
    organizationId: '2'
  }),
  useMatches: vi.fn(() => [])
}));

describe('DebtPositionDetail', async () => {
  it('renders as expected without crashing', () => {
    (utils.storage.app.getBrokerId as Mock).mockReturnValue(3);

    const mockGetDebtPositionDetail = (utils.loaders.getDebtPositionDetail as Mock).mockReturnValue(
      {
        data: debtPosition,
        isSuccess: true,
        isLoading: false
      }
    );

    render(<DebtPositionDetail />);

    expect(mockGetDebtPositionDetail).toBeCalledWith(3, 1, 2);

    const title = screen.getByTestId('debt-position-detail-title').innerHTML;
    expect(title).toContain('debtPositionTypeOrgDescription test description');

    const orgName = screen.getByTestId('debt-position-detail-org-name').innerHTML;
    expect(orgName).toContain('OrgName test');

    const orgCode = screen.getByTestId('debt-position-detail-org-code').innerHTML;
    expect(orgCode).toContain('ABC123');

    const iupd = screen.getByTestId('debt-position-detail-iupd').innerHTML;
    expect(iupd).toContain('123456');
  });
});
