/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '__tests__/renderers';
import { useTranslation } from 'react-i18next';
import React from 'react';
import PaymentOptionWrapper from './PaymentOptions';

// Mock external dependencies
vi.mock('react-i18next', () => ({
  useTranslation: vi.fn()
}));

// Mock child components
vi.mock('./PaymentOptionItem', () => ({
  __esModule: true,
  default: ({ selectionStatus }: { selectionStatus: string }) => (
    <div data-testid="payment-option-item" data-status={selectionStatus}>
      Mock PaymentOptionItem
    </div>
  )
}));

vi.mock('./PaymentOptionActions', () => ({
  __esModule: true,
  default: () => <div data-testid="payment-options-actions">Mock Actions</div>
}));

// Mock generated types (minimal)
const mockPaymentOption: any = {
  paymentOptionId: 123,
  paymentOptionType: 'INSTALLMENT',
  installments: []
};

describe('PaymentOptionWrapper - auto-select single option useEffect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useTranslation as any).mockReturnValue({ t: (key: string) => key });
  });

  it('automatically selects payment option when only one option is provided', async () => {
    const props = {
      paymentOptions: [mockPaymentOption],
      debtPositionId: 1,
      orgInfo: { orgName: 'Test Org', orgId: 'org-1' }
    };

    render(<PaymentOptionWrapper {...props} />);

    await waitFor(() => {
      expect(screen.getByTestId('payment-option-item')).toHaveAttribute('data-status', 'selected');
    });
  });

  it('does not auto-select when multiple options are provided', async () => {
    const props = {
      paymentOptions: [mockPaymentOption, { ...mockPaymentOption, paymentOptionId: 456 }],
      debtPositionId: 1,
      orgInfo: { orgName: 'Test Org', orgId: 'org-1' }
    };

    render(<PaymentOptionWrapper {...props} />);

    await waitFor(() => {
      // No auto-selection, should be unselected initially
      const items = screen.getAllByTestId('payment-option-item');
      expect(items[0]).toHaveAttribute('data-status', 'unselected');
      expect(items[1]).toHaveAttribute('data-status', 'unselected');
    });
  });

  it('does not auto-select when no options are provided', async () => {
    const props = {
      paymentOptions: [],
      debtPositionId: 1,
      orgInfo: { orgName: 'Test Org', orgId: 'org-1' }
    };

    render(<PaymentOptionWrapper {...props} />);

    await waitFor(() => {
      expect(screen.queryByTestId('payment-option-item')).not.toBeInTheDocument();
    });
  });
});
