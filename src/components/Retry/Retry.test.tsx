import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Retry } from '../Retry';

describe('Retry Component', () => {
  it('renders without crashing', () => {
    render(<Retry action={() => undefined} />);
  });

  it('calls action function without crashing', () => {
    const action = vi.fn();
    render(<Retry action={action} />);
    const button = screen.getByRole('button', { name: 'app.retry.action' });
    fireEvent.click(button);
    expect(action).toHaveBeenCalled();
  });
});
