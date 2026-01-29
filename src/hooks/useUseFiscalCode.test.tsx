import { renderHook, waitFor } from '@testing-library/react';
import utils from 'utils';
import { UseQueryResult } from '@tanstack/react-query';
import { UserInfo } from '../../generated/apiClient';
import { useUserFiscalCode } from './useUserFiscalCode';

describe('useUserFiscalCode', () => {
  it('should return user fiscal code', async () => {
    // Arrange
    const mockQueryResult = {
      data: {
        userId: '_476b655b48c6e73bb210666077eba3a9',
        fiscalCode: 'TINIT-PLOMRC01P30L736Y',
        familyName: 'Polo',
        name: 'Marco',
        email: 'ilmilione@virgilio.it'
      }
    };

    const mockFiscalCode = 'TINIT-PLOMRC01P30L736Y';

    vi.spyOn(utils.loaders, 'getUserInfo').mockReturnValue(
      mockQueryResult as UseQueryResult<UserInfo, Error>
    );

    // Act
    const { result } = renderHook(() => useUserFiscalCode());

    // Assert
    expect(utils.loaders.getUserInfo).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(result.current).toEqual(mockFiscalCode);
    });
  });
});
