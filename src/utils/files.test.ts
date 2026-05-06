import { describe, it, expect, vi, beforeEach, afterEach, MockInstance } from 'vitest';
import files, { downloadBlob, downloadReceipt } from './files';
import { ROUTES, OUTCOMES } from 'routes/routes';

// Ensure URL methods exist in the environment
if (typeof URL.createObjectURL === 'undefined') {
  URL.createObjectURL = vi.fn();
}
if (typeof URL.revokeObjectURL === 'undefined') {
  URL.revokeObjectURL = vi.fn();
}

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  generatePath: vi.fn((path: string, params: Record<string, string | number | undefined>) => {
    let result = path;
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
        result = result.replace(`:${key}`, String(value));
      }
    }
    return result;
  })
}));

const { mockNotifyEmit } = vi.hoisted(() => ({
  mockNotifyEmit: vi.fn()
}));

vi.mock('utils', () => ({
  default: {
    notify: {
      emit: mockNotifyEmit
    }
  }
}));

vi.mock('translations/i18n', () => ({
  default: {
    t: (key: string) => key
  }
}));

describe('files utility', () => {
  describe('downloadFile', () => {
    let createObjectURLSpy: MockInstance;
    let revokeObjectURLSpy: MockInstance;

    beforeEach(() => {
      createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:url');
      revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => ({}) as Node);
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => ({}) as Node);

      vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        if (tagName === 'a') {
          return {
            href: '',
            download: '',
            click: vi.fn()
          } as unknown as HTMLAnchorElement;
        }
        return {} as HTMLElement;
      });
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should create a link and trigger click to download a file', () => {
      const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' });
      files.downloadFile(mockFile, 'test.txt');

      expect(createObjectURLSpy).toHaveBeenCalledWith(mockFile);
      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(document.body.appendChild).toHaveBeenCalled();
      expect(document.body.removeChild).toHaveBeenCalled();
      expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:url');
    });
  });

  describe('downloadBlob', () => {
    let createObjectURLSpy: MockInstance;
    let revokeObjectURLSpy: MockInstance;

    beforeEach(() => {
      createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:url');
      revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => ({}) as Node);
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => ({}) as Node);
      vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        if (tagName === 'a') {
          return {
            href: '',
            download: '',
            click: vi.fn()
          } as unknown as HTMLAnchorElement;
        }
        return {} as HTMLElement;
      });
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should throw an error if blob is empty', () => {
      expect(() => downloadBlob(null as unknown as Blob, 'test.txt')).toThrow('Empty file');
      expect(() => downloadBlob(new Blob([], { type: 'text/plain' }), 'test.txt')).toThrow(
        'Empty file'
      );
    });

    it('should create a link and trigger click to download a blob', () => {
      const mockBlob = new Blob(['content'], { type: 'text/plain' });
      downloadBlob(mockBlob, 'test.txt');

      expect(createObjectURLSpy).toHaveBeenCalledWith(mockBlob);
      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:url');
    });
  });

  describe('generateDownloadUrl', () => {
    const params = {
      orgId: 123,
      nav: 'NAV123',
      fiscalCode: 'RSSMRA80A01H501U',
      isAnonymous: false
    };

    it('should generate a private download URL when not anonymous', () => {
      const url = files.generateDownloadUrl(params);
      const expectedBase = ROUTES.PAYMENTS_ON_THE_FLY_DOWNLOAD.split('/:')[0];
      expect(url).toContain(expectedBase);
      expect(url).toContain('123');
      expect(url).toContain('NAV123');
      expect(url).toContain('#debtorFiscalCode=RSSMRA80A01H501U');
    });

    it('should generate a public download URL when anonymous', () => {
      const url = files.generateDownloadUrl({ ...params, isAnonymous: true });
      const expectedBase = ROUTES.public.PAYMENTS_ON_THE_FLY_DOWNLOAD.split('/:')[0];
      expect(url).toContain(expectedBase);
      expect(url).toContain('123');
      expect(url).toContain('NAV123');
      expect(url).toContain('#debtorFiscalCode=RSSMRA80A01H501U');
    });

    it('should return a private courtesy page URL on missing params', () => {
      const url = files.generateDownloadUrl({ ...params, nav: undefined });
      const expectedBase = ROUTES.COURTESY_PAGE.split('/:')[0];
      expect(url).toContain(expectedBase);
      expect(url).toContain(String(OUTCOMES[400]));
    });

    it('should return a public courtesy page URL on missing params when anonymous', () => {
      const url = files.generateDownloadUrl({ ...params, nav: undefined, isAnonymous: true });
      const urlBase = ROUTES.public.COURTESY_PAGE.split('/:')[0];
      expect(url).toContain(urlBase);
      expect(url).toContain(String(OUTCOMES[400]));
    });
  });

  describe('downloadReceipt', () => {
    const mockArgs = {
      organizationId: 456,
      receiptId: 123,
      fiscalCode: 'RSSMRA80A01H501U'
    };

    const mockMutateAsync = vi.fn();

    beforeEach(() => {
      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:url');
      vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
      vi.spyOn(document.body, 'appendChild').mockImplementation(() => ({}) as Node);
      vi.spyOn(document.body, 'removeChild').mockImplementation(() => ({}) as Node);
      vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        if (tagName === 'a') {
          return {
            href: '',
            download: '',
            click: vi.fn()
          } as unknown as HTMLAnchorElement;
        }
        return {} as HTMLElement;
      });
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    it('should call mutateAsync and trigger download on success', async () => {
      const mockFile = new File(['content'], 'receipt.pdf', { type: 'application/pdf' });
      mockMutateAsync.mockResolvedValue({ blob: mockFile, filename: 'receipt_123.pdf' });

      await downloadReceipt(mockMutateAsync, mockArgs);

      expect(mockMutateAsync).toHaveBeenCalledWith({
        organizationId: 456,
        receiptId: 123,
        fiscalCode: 'RSSMRA80A01H501U'
      });
      expect(document.createElement).toHaveBeenCalledWith('a');
    });

    it('should fallback to receiptId.pdf if filename is missing', async () => {
      const mockFile = new File(['content'], 'receipt.pdf', { type: 'application/pdf' });
      mockMutateAsync.mockResolvedValue({ blob: mockFile, filename: null });

      const createElementSpy = vi.spyOn(document, 'createElement');

      await downloadReceipt(mockMutateAsync, mockArgs);

      const link = createElementSpy.mock.results.find((r) => r.type === 'return')?.value;
      if (link) {
        expect(link.download).toBe('123.pdf');
      }
    });

    it('should emit error notification on missing parameters', async () => {
      await downloadReceipt(mockMutateAsync, {
        ...mockArgs,
        receiptId: undefined
      } as unknown as Parameters<typeof downloadReceipt>[1]);

      expect(mockNotifyEmit).toHaveBeenCalledWith('app.receiptDetail.downloadError');
      expect(mockMutateAsync).not.toHaveBeenCalled();
    });

    it('should emit error notification if mutateAsync fails', async () => {
      mockMutateAsync.mockRejectedValue(new Error('API Error'));

      await downloadReceipt(mockMutateAsync, mockArgs);

      expect(mockNotifyEmit).toHaveBeenCalledWith('app.receiptDetail.downloadError');
    });
  });
});
