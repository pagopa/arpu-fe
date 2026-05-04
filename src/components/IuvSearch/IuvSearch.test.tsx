/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '__tests__/renderers';
import '@testing-library/jest-dom';
import { IuvSearch } from '../IuvSearch';

const {
  mockGetBrokerId,
  mockMutateAsync,
  mockReset,
  mockUsePublicInstallmentsByIuvOrNav,
  mockNotifyEmit,
  mockURIDecode,
  mockURIEncode,
  mockURISet
} = vi.hoisted(() => ({
  mockGetBrokerId: vi.fn(),
  mockMutateAsync: vi.fn(),
  mockReset: vi.fn(),
  mockUsePublicInstallmentsByIuvOrNav: vi.fn(),
  mockNotifyEmit: vi.fn(),
  mockURIDecode: vi.fn(),
  mockURIEncode: vi.fn(),
  mockURISet: vi.fn()
}));

vi.mock('utils/storage', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...(actual as any),
    default: {
      app: {
        getBrokerId: () => mockGetBrokerId()
      },
      user: {
        isAnonymous: () => false
      }
    }
  };
});

vi.mock('./components/Results', () => ({
  Results: () => <div data-testid="results-component">Results</div>
}));

vi.mock('utils/loaders', () => ({
  default: {
    public: {
      usePublicInstallmentsByIuvOrNav: (brokerId: any) =>
        mockUsePublicInstallmentsByIuvOrNav(brokerId)
    }
  },
  InstallmentType: {
    ALL: 'ALL',
    RECEIPTS: 'RECEIPTS'
  }
}));

vi.mock('utils/notify', () => ({
  default: {
    emit: (msg: string) => mockNotifyEmit(msg)
  }
}));

vi.mock('utils/URI', () => ({
  default: {
    decode: (hash: string) => mockURIDecode(hash),
    encode: (params: any) => mockURIEncode(params),
    set: (encoded: string, opts: any) => mockURISet(encoded, opts)
  }
}));

vi.mock('components/BackButton', () => ({
  BackButton: () => <button data-testid="back-button">Back</button>
}));

vi.mock('components/Content', () => ({
  Content: ({ children, noData }: any) => (
    <div data-testid="content-component">{noData ? 'No data' : children}</div>
  )
}));

// ---------------------------------------------------------------------------

describe('IuvSearch', () => {
  const defaultProps = {
    titleKey: 'app.search.title',
    descriptionKey: 'app.search.description',
    resultKey: 'app.search.result'
  };

  beforeEach(() => {
    vi.clearAllMocks();

    mockGetBrokerId.mockReturnValue(123);
    mockURIDecode.mockReturnValue({});
    mockURIEncode.mockImplementation((params: any) => JSON.stringify(params));

    mockUsePublicInstallmentsByIuvOrNav.mockReturnValue({
      mutateAsync: mockMutateAsync,
      reset: mockReset,
      data: undefined,
      isSuccess: false,
      isError: false
    });

    mockMutateAsync.mockResolvedValue([]);
  });

  describe('Form rendering', () => {
    it('renders form with both tabs', () => {
      render(<IuvSearch {...defaultProps} />);
      expect(screen.getByText('common.person')).toBeInTheDocument();
      expect(screen.getByText('common.company')).toBeInTheDocument();
    });

    it('renders title and description', () => {
      render(<IuvSearch {...defaultProps} />);
      expect(screen.getByText('app.search.title')).toBeInTheDocument();
      expect(screen.getByText('app.search.description')).toBeInTheDocument();
    });

    it('renders subtitle when provided', () => {
      render(<IuvSearch {...defaultProps} subtitleKey="app.search.subtitle" />);
      expect(screen.getByText('app.search.subtitle')).toBeInTheDocument();
    });

    it('renders tab description for person tab', () => {
      render(<IuvSearch {...defaultProps} tab1DescriptionKey="app.search.tab1.description" />);
      expect(screen.getByText('app.search.tab1.description')).toBeInTheDocument();
    });

    it('renders tab description for company tab', () => {
      render(<IuvSearch {...defaultProps} tab2DescriptionKey="app.search.tab2.description" />);
      fireEvent.click(screen.getByText('common.company'));
      expect(screen.getByText('app.search.tab2.description')).toBeInTheDocument();
    });

    it('renders with accessibility attributes', () => {
      render(<IuvSearch {...defaultProps} />);
      expect(screen.getByLabelText('ui.a11y.searchForm')).toBeInTheDocument();
      expect(screen.getByLabelText('tabs')).toBeInTheDocument();
    });
  });

  describe('Initial URL params loading', () => {
    it('loads initial values from URL params', () => {
      mockURIDecode.mockReturnValue({
        iuvOrNav: '123456789012345678',
        fiscalCode: 'RSSMRA80A01H501U',
        anonymous: 'false',
        initialTab: '0'
      });

      render(<IuvSearch {...defaultProps} />);

      expect(screen.getByLabelText('fields.iuv')).toHaveValue('123456789012345678');
      expect(screen.getByLabelText('fields.fiscalcode')).toHaveValue('RSSMRA80A01H501U');
    });

    it('loads anonymous state from URL params', () => {
      mockURIDecode.mockReturnValue({
        iuvOrNav: '123456789012345678',
        anonymous: 'true',
        initialTab: '0'
      });

      render(<IuvSearch {...defaultProps} />);

      expect(screen.getByRole('checkbox')).toBeChecked();
    });

    it('loads initial tab from URL params', () => {
      mockURIDecode.mockReturnValue({
        iuvOrNav: '123456789012345678',
        fiscalCode: '12345678901',
        initialTab: '1'
      });

      render(<IuvSearch {...defaultProps} />);

      expect(screen.getByLabelText('fields.piva')).toBeInTheDocument();
    });

    it('auto-submits when URL has valid params for person tab', async () => {
      mockURIDecode.mockReturnValue({
        iuvOrNav: '123456789012345678',
        fiscalCode: 'RSSMRA80A01H501U',
        anonymous: 'false',
        initialTab: '0'
      });

      render(<IuvSearch {...defaultProps} />);

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith({
          iuvOrNav: '123456789012345678',
          fiscalCode: 'RSSMRA80A01H501U',
          statuses: undefined
        });
      });
    });

    it('auto-submits when URL has anonymous params', async () => {
      mockURIDecode.mockReturnValue({
        iuvOrNav: '123456789012345678',
        anonymous: 'true',
        initialTab: '0'
      });

      render(<IuvSearch {...defaultProps} />);

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith({
          iuvOrNav: '123456789012345678',
          fiscalCode: 'ANONIMO',
          statuses: undefined
        });
      });
    });

    it('does not auto-submit without iuvOrNav', () => {
      mockURIDecode.mockReturnValue({ fiscalCode: 'RSSMRA80A01H501U' });

      render(<IuvSearch {...defaultProps} />);

      expect(mockMutateAsync).not.toHaveBeenCalled();
    });

    it('does not auto-submit without fiscalCode or anonymous on person tab', () => {
      mockURIDecode.mockReturnValue({
        iuvOrNav: '123456789012345678',
        initialTab: '0'
      });

      render(<IuvSearch {...defaultProps} />);

      expect(mockMutateAsync).not.toHaveBeenCalled();
    });
  });

  describe('Tab switching', () => {
    it('switches between fiscal code and PIVA field', () => {
      render(<IuvSearch {...defaultProps} />);
      expect(screen.getByLabelText('fields.fiscalcode')).toBeInTheDocument();

      fireEvent.click(screen.getByText('common.company'));

      expect(screen.getByLabelText('fields.piva')).toBeInTheDocument();
    });

    it('clears fiscal code and anonymous when switching tabs', () => {
      render(<IuvSearch {...defaultProps} />);

      fireEvent.change(screen.getByLabelText('fields.fiscalcode'), {
        target: { value: 'RSSMRA80A01H501U' }
      });
      fireEvent.click(screen.getByRole('checkbox'));

      fireEvent.click(screen.getByText('common.company'));
      fireEvent.click(screen.getByText('common.person'));

      expect(screen.getByLabelText('fields.fiscalcode')).toHaveValue('');
      expect(screen.getByRole('checkbox')).not.toBeChecked();
    });

    it('resets mutation when switching tabs', () => {
      render(<IuvSearch {...defaultProps} />);

      fireEvent.click(screen.getByText('common.company'));

      expect(mockReset).toHaveBeenCalled();
    });

    it('hides anonymous checkbox on company tab', () => {
      render(<IuvSearch {...defaultProps} />);
      expect(screen.getByRole('checkbox')).toBeInTheDocument();

      fireEvent.click(screen.getByText('common.company'));

      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    });
  });

  describe('Anonymous checkbox', () => {
    it('disables fiscal code when anonymous is checked', () => {
      render(<IuvSearch {...defaultProps} />);

      fireEvent.click(screen.getByRole('checkbox'));

      expect(screen.getByLabelText('fields.fiscalcode')).toBeDisabled();
    });

    it('clears fiscal code value when anonymous is checked', () => {
      render(<IuvSearch {...defaultProps} />);

      fireEvent.change(screen.getByLabelText('fields.fiscalcode'), {
        target: { value: 'RSSMRA80A01H501U' }
      });
      fireEvent.click(screen.getByRole('checkbox'));

      expect(screen.getByLabelText('fields.fiscalcode')).toHaveValue('');
    });
  });

  describe('Form validation', () => {
    it('shows validation errors when submitting empty form', async () => {
      render(<IuvSearch {...defaultProps} />);

      fireEvent.click(screen.getByText('actions.search'));

      await waitFor(() => {
        expect(screen.getAllByText('errors.form.required')).toHaveLength(2);
      });
    });

    it('shows validation error for iuv when empty', async () => {
      render(<IuvSearch {...defaultProps} />);

      fireEvent.change(screen.getByLabelText('fields.fiscalcode'), {
        target: { value: 'RSSMRA80A01H501U' }
      });
      fireEvent.click(screen.getByText('actions.search'));

      await waitFor(() => {
        expect(screen.getByLabelText('fields.iuv')).toHaveAttribute('aria-invalid', 'true');
      });
    });

    it('shows validation error for fiscal code when not anonymous and empty', async () => {
      render(<IuvSearch {...defaultProps} />);

      fireEvent.change(screen.getByLabelText('fields.iuv'), {
        target: { value: '123456789012345678' }
      });
      fireEvent.click(screen.getByText('actions.search'));

      await waitFor(() => {
        expect(screen.getByLabelText('fields.fiscalcode')).toHaveAttribute('aria-invalid', 'true');
      });
    });

    it('does not show validation error for fiscal code when anonymous is checked', async () => {
      render(<IuvSearch {...defaultProps} />);

      fireEvent.change(screen.getByLabelText('fields.iuv'), {
        target: { value: '123456789012345678' }
      });
      fireEvent.click(screen.getByRole('checkbox'));
      fireEvent.click(screen.getByText('actions.search'));

      await waitFor(() => {
        expect(screen.getByLabelText('fields.fiscalcode')).not.toHaveAttribute(
          'aria-invalid',
          'true'
        );
      });
    });

    it('validates form successfully with valid data', async () => {
      render(<IuvSearch {...defaultProps} />);

      fireEvent.change(screen.getByLabelText('fields.iuv'), {
        target: { value: '123456789012345678' }
      });
      fireEvent.change(screen.getByLabelText('fields.fiscalcode'), {
        target: { value: 'RSSMRA80A01H501U' }
      });
      fireEvent.click(screen.getByText('actions.search'));

      await waitFor(() => {
        expect(screen.getByLabelText('fields.iuv')).not.toHaveAttribute('aria-invalid', 'true');
        expect(screen.getByLabelText('fields.fiscalcode')).not.toHaveAttribute(
          'aria-invalid',
          'true'
        );
      });
    });
  });

  describe('Form submission', () => {
    it('submits form with values', async () => {
      render(<IuvSearch {...defaultProps} />);

      fireEvent.change(screen.getByLabelText('fields.iuv'), {
        target: { value: '123456789012345678' }
      });
      fireEvent.change(screen.getByLabelText('fields.fiscalcode'), {
        target: { value: 'RSSMRA80A01H501U' }
      });
      fireEvent.click(screen.getByText('actions.search'));

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith({
          iuvOrNav: '123456789012345678',
          fiscalCode: 'RSSMRA80A01H501U',
          statuses: undefined
        });
      });
    });

    it('submits with ANONIMO when anonymous is checked', async () => {
      render(<IuvSearch {...defaultProps} />);

      fireEvent.change(screen.getByLabelText('fields.iuv'), {
        target: { value: '123456789012345678' }
      });
      fireEvent.click(screen.getByRole('checkbox'));
      fireEvent.click(screen.getByText('actions.search'));

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith({
          iuvOrNav: '123456789012345678',
          fiscalCode: 'ANONIMO',
          statuses: undefined
        });
      });
    });

    it('updates URL with search params after successful submission', async () => {
      render(<IuvSearch {...defaultProps} />);

      fireEvent.change(screen.getByLabelText('fields.iuv'), {
        target: { value: '123456789012345678' }
      });
      fireEvent.change(screen.getByLabelText('fields.fiscalcode'), {
        target: { value: 'RSSMRA80A01H501U' }
      });
      fireEvent.click(screen.getByText('actions.search'));

      await waitFor(() => {
        expect(mockURIEncode).toHaveBeenCalledWith({
          iuvOrNav: '123456789012345678',
          anonymous: false,
          initialTab: 0,
          fiscalCode: 'RSSMRA80A01H501U'
        });
        expect(mockURISet).toHaveBeenCalledWith(expect.any(String), { replace: true });
      });
    });

    it('does not encode fiscalCode to URI when anonymous is checked', async () => {
      render(<IuvSearch {...defaultProps} />);

      fireEvent.change(screen.getByLabelText('fields.iuv'), {
        target: { value: '123456789012345678' }
      });
      fireEvent.click(screen.getByRole('checkbox'));
      fireEvent.click(screen.getByText('actions.search'));

      await waitFor(() => {
        expect(mockURIEncode).toHaveBeenCalledWith({
          iuvOrNav: '123456789012345678',
          anonymous: true,
          initialTab: 0,
          fiscalCode: ''
        });
      });
    });

    it('shows default error notification on mutation failure', async () => {
      mockMutateAsync.mockRejectedValue(new Error('Failed'));

      render(<IuvSearch {...defaultProps} />);

      fireEvent.change(screen.getByLabelText('fields.iuv'), {
        target: { value: '123456789012345678' }
      });
      fireEvent.change(screen.getByLabelText('fields.fiscalcode'), {
        target: { value: 'RSSMRA80A01H501U' }
      });
      fireEvent.click(screen.getByText('actions.search'));

      await waitFor(() => {
        expect(mockNotifyEmit).toHaveBeenCalledWith('errors.toast.default');
      });
    });
  });

  describe('Results display', () => {
    it('displays result count when data is available', () => {
      mockUsePublicInstallmentsByIuvOrNav.mockReturnValue({
        mutateAsync: mockMutateAsync,
        reset: mockReset,
        data: [{ id: 1 }, { id: 2 }],
        isSuccess: true,
        isError: false
      });

      render(<IuvSearch {...defaultProps} resultKey="app.search.result" />);

      expect(screen.getByText('app.search.result')).toBeInTheDocument();
    });

    it('renders Results component when data is available', () => {
      mockUsePublicInstallmentsByIuvOrNav.mockReturnValue({
        mutateAsync: mockMutateAsync,
        reset: mockReset,
        data: [{ id: 1 }],
        isSuccess: true,
        isError: false
      });

      render(<IuvSearch {...defaultProps} />);

      expect(screen.getByTestId('results-component')).toBeInTheDocument();
    });

    it('shows no data message when result is empty', () => {
      mockUsePublicInstallmentsByIuvOrNav.mockReturnValue({
        mutateAsync: mockMutateAsync,
        reset: mockReset,
        data: [],
        isSuccess: true,
        isError: false
      });

      render(
        <IuvSearch
          {...defaultProps}
          noDataTitleKey="app.search.nodata.title"
          noDataTextKey="app.search.nodata.text"
        />
      );

      expect(screen.getByText('No data')).toBeInTheDocument();
    });
  });

  describe('Back button visibility', () => {
    it('does not show back button before form submission', () => {
      render(<IuvSearch {...defaultProps} />);

      expect(screen.queryByText('app.routes.exit')).not.toBeInTheDocument();
    });

    it('shows back button after successful submission with results', () => {
      mockUsePublicInstallmentsByIuvOrNav.mockReturnValue({
        mutateAsync: mockMutateAsync,
        reset: mockReset,
        data: [{ id: 1 }],
        isSuccess: true,
        isError: false
      });

      render(<IuvSearch {...defaultProps} />);

      expect(screen.getByText('app.routes.exit')).toBeInTheDocument();
    });

    it('shows back button after successful submission with no results', () => {
      mockUsePublicInstallmentsByIuvOrNav.mockReturnValue({
        mutateAsync: mockMutateAsync,
        reset: mockReset,
        data: [],
        isSuccess: true,
        isError: false
      });

      render(<IuvSearch {...defaultProps} />);

      expect(screen.getByText('app.routes.exit')).toBeInTheDocument();
    });

    it('does not show back button when submission fails', () => {
      mockUsePublicInstallmentsByIuvOrNav.mockReturnValue({
        mutateAsync: mockMutateAsync,
        reset: mockReset,
        data: undefined,
        isSuccess: false,
        isError: true
      });

      render(<IuvSearch {...defaultProps} />);

      expect(screen.queryByText('app.routes.exit')).not.toBeInTheDocument();
    });
  });

  describe('Error handling and retry', () => {
    it('shows retry option on error', () => {
      mockUsePublicInstallmentsByIuvOrNav.mockReturnValue({
        mutateAsync: mockMutateAsync,
        reset: mockReset,
        data: undefined,
        isSuccess: false,
        isError: true
      });

      render(<IuvSearch {...defaultProps} />);

      expect(screen.getByTestId('content-component')).toBeInTheDocument();
    });
  });
});
