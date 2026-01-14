import React from 'react';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { StoreProvider, useStore } from './GlobalStore';
import * as userActions from './UserInfoStore';

describe('StoreProvider and useStore', () => {
  const TestUserInfoComponent: React.FC = () => {
    const { state } = useStore();

    return (
      <div>
        <p>{state.userInfo?.name}</p>
        <button onClick={() => userActions.setUserInfo({ name: 'John', userId: '1' })}>
          Update User
        </button>
      </div>
    );
  };

  it('allows user info state to be updated', () => {
    render(
      <StoreProvider>
        <TestUserInfoComponent />
      </StoreProvider>
    );

    const spyedSetUserInfo = vi.spyOn(userActions, 'setUserInfo');

    userActions.setUserInfo({ name: 'John', userId: '1' });

    expect(spyedSetUserInfo).toHaveBeenCalledWith({ name: 'John', userId: '1' });
  });

  it('throws an error when useStore is used outside of StoreProvider', () => {
    const renderWithoutProvider = () => render(<TestUserInfoComponent />);

    expect(renderWithoutProvider).toThrow('useStore must be used within a StoreProvider');
  });
});
