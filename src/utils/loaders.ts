import { useQuery, useMutation } from '@tanstack/react-query';
import utils from 'utils';
import { ZodSchema } from 'zod';
import * as zodSchema from '../../generated/zod-schema';
import { DebtPositionRequestDTO, InstallmentStatus } from '../../generated/data-contracts';
import { FilteredRequest } from 'models/Filters';
import { STATE } from 'store/types';

const parseAndLog = <T>(schema: ZodSchema, data: T, throwError: boolean = true): void | never => {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(result.error.issues);
    if (throwError) throw result.error;
  }
};

const getUserInfo = () => {
  return useQuery({
    queryKey: ['userInfo'],
    queryFn: async () => {
      const { data: userInfo } = await utils.apiClient.auth.getUserInfo();
      parseAndLog(zodSchema.userInfoSchema, userInfo);
      return userInfo;
    },
    gcTime: Infinity
  });
};

const getUserInfoOnce = () => {
  return useQuery({
    queryKey: ['userInfoOnce'],
    queryFn: async () => {
      const { data: userInfo } = await utils.apiClient.auth.getUserInfo();
      parseAndLog(zodSchema.userInfoSchema, userInfo);
      return userInfo;
    },
    // TODO check global state instead of
    // storage once preact/signals
    // testing is fixed
    enabled: !sessionStorage.getItem(STATE.USER_INFO)
  });
};

const getPagedDebtorReceipts = (brokerId: number) =>
  useMutation({
    mutationKey: ['pagedDebtorReceipts', brokerId],
    mutationFn: async (args: FilteredRequest) => {
      const query = {
        sort: args.sort,
        ...args.pagination,
        ...args.filters
      };
      const { data } = await utils.apiClient.brokers.getPagedDebtorReceipts(brokerId, query);
      return data;
    }
  });

/** returns the TokenResponse or null if an error occours */
export const getTokenOneidentity = async (request: Request) => {
  const currentUrl = new URL(request.url);
  const searchParams = new URLSearchParams(currentUrl.search);
  const code = searchParams.get('code') || '';
  const state = searchParams.get('state') || '';

  try {
    const { data: TokenResponse } = await utils.apiClient.token.getAuthenticationToken(
      {
        code,
        state
      },
      { withCredentials: true }
    );
    parseAndLog(zodSchema.tokenResponseSchema, TokenResponse);
    return TokenResponse;
  } catch {
    return null;
  }
};

export const createSpontaneousDebtPosition = (brokerId: number, body: DebtPositionRequestDTO) =>
  useQuery({
    queryKey: ['createSpontaneousDebtPosition'],
    queryFn: async () => {
      const { data } = await utils.apiClient.brokers.createSpontaneousDebtPosition(brokerId, body);
      return data;
    }
  });

export const createPublicSpontaneousDebtPosition = (
  brokerId: number,
  body: DebtPositionRequestDTO
) =>
  useQuery({
    queryKey: ['createSpontaneousDebtPosition'],
    queryFn: async () => {
      const { data } = await utils.apiClient.public.createPublicSpontaneousDebtPosition(
        brokerId,
        body
      );
      return data;
    }
  });

export const getOrganizationsWithSpontaneous = (brokerId: number) =>
  useQuery({
    queryKey: ['getOrganizationsWithSpontaneous'],
    queryFn: async () => {
      const { data } = await utils.apiClient.brokers.getOrganizationsWithSpontaneous(brokerId);
      return data;
    }
  });

export const getPublicOrganizationsWithSpontaneous = (brokerId: number) =>
  useQuery({
    queryKey: ['getPublicOrganizationsWithSpontaneous'],
    queryFn: async () => {
      const { data } = await utils.apiClient.public.getPublicOrganizationsWithSpontaneous(brokerId);
      return data;
    }
  });

export const getDebtPositionTypeOrgsWithSpontaneous = (brokerId: number, organizationId: number) =>
  useQuery({
    queryKey: ['getDebtPositionTypeOrgsWithSpontaneous'],
    queryFn: async () => {
      const { data } = await utils.apiClient.brokers.getDebtPositionTypeOrgsWithSpontaneous(
        brokerId,
        organizationId
      );
      return data;
    }
  });

export const getPublicDebtPositionTypeOrgsWithSpontaneous = (
  brokerId: number,
  organizationId: number
) =>
  useQuery({
    queryKey: ['getPublicDebtPositionTypeOrgsWithSpontaneous'],
    queryFn: async () => {
      const { data } = await utils.apiClient.public.getPublicDebtPositionTypeOrgsWithSpontaneous(
        brokerId,
        organizationId
      );
      return data;
    }
  });

export const getDebtPositionTypeOrgsWithSpontaneousDetail = (
  brokerId: number,
  organizationId: number,
  debtPositionTypeOrgId: number
) =>
  useQuery({
    queryKey: ['getDebtPositionTypeOrgsWithSpontaneousDetail'],
    queryFn: async () => {
      const { data } = await utils.apiClient.brokers.getDebtPositionTypeOrgsWithSpontaneousDetail(
        brokerId,
        organizationId,
        debtPositionTypeOrgId
      );
      return data;
    }
  });

export const getPublicDebtPositionTypeOrgsWithSpontaneousDetail = (
  brokerId: number,
  organizationId: number,
  debtPositionTypeOrgId: number
) =>
  useQuery({
    queryKey: ['getPublicDebtPositionTypeOrgsWithSpontaneousDetail'],
    queryFn: async () => {
      const { data } =
        await utils.apiClient.public.getPublicDebtPositionTypeOrgsWithSpontaneousDetail(
          brokerId,
          organizationId,
          debtPositionTypeOrgId
        );
      return data;
    }
  });

type GetPaymentNoticeQueryParam = {
  /** @format int64 */
  installmentId?: number;
  iuv?: string;
  iud?: string;
};

export const getPaymentNotice = (
  brokerId: number,
  organizationId: number,
  query: GetPaymentNoticeQueryParam,
  debtorFiscalCode?: string
) =>
  useMutation({
    mutationKey: ['getPaymentNotice'],
    mutationFn: async () => {
      const response = await utils.apiClient.brokers.getPaymentNotice(
        brokerId,
        organizationId,
        query,
        { format: 'blob', headers: { 'X-fiscal-code': debtorFiscalCode } }
      );

      const contentDisposition = response.headers['content-disposition'] || '';
      const filename = utils.converters.extractFilename(contentDisposition);
      return { data: response.data, filename };
    },
    throwOnError: true
  });

export const getPublicPaymentNotice = (
  brokerId: number,
  organizationId: number,
  query: GetPaymentNoticeQueryParam,
  debtorFiscalCode: string
) =>
  useMutation({
    mutationKey: ['getPaymentNotice'],
    mutationFn: async () => {
      const response = await utils.apiClient.public.getPublicPaymentNotice(
        brokerId,
        organizationId,
        query,
        { format: 'blob', headers: { 'X-fiscal-code': debtorFiscalCode } }
      );
      const contentDisposition = response.headers['content-disposition'] || '';
      const filename = utils.converters.extractFilename(contentDisposition);
      return { data: response.data, filename };
    },
    throwOnError: true
  });

type ReceiptDetailArgs = {
  brokerId: number;
  organizationId: number;
  receiptId: number;
  fiscalCode?: string;
};

const useReceiptDetail = ({ brokerId, organizationId, receiptId, fiscalCode }: ReceiptDetailArgs) =>
  useQuery({
    queryKey: ['receiptDetail', brokerId, organizationId, receiptId],
    queryFn: async () => {
      const { data } = await utils.apiClient.brokers.getReceiptDetail(
        brokerId,
        organizationId,
        receiptId,
        { headers: { 'X-fiscal-code': fiscalCode } }
      );
      return data;
    },
    throwOnError: true
  });

const usePublicReceiptDetail = ({
  brokerId,
  organizationId,
  receiptId,
  fiscalCode
}: ReceiptDetailArgs) =>
  useQuery({
    queryKey: ['publicReceiptDetail', brokerId, organizationId, receiptId],
    queryFn: async () => {
      const { data } = await utils.apiClient.public.getPublicReceiptDetail(
        brokerId,
        organizationId,
        receiptId,
        { headers: { 'X-fiscal-code': fiscalCode } }
      );
      return data;
    },
    throwOnError: true
  });

const useDownloadReceipt = ({ brokerId }: Pick<ReceiptDetailArgs, 'brokerId'>) =>
  useMutation({
    mutationKey: ['downloadReceipt', brokerId],
    mutationFn: async ({
      organizationId,
      receiptId,
      fiscalCode
    }: Pick<ReceiptDetailArgs, 'organizationId' | 'receiptId' | 'fiscalCode'>) => {
      const response = await utils.apiClient.brokers.getReceiptPdf(
        brokerId,
        organizationId,
        receiptId,
        { format: 'blob', headers: { 'X-fiscal-code': fiscalCode } }
      );
      const contentDisposition = response.headers['content-disposition'] || '';
      const filename = utils.converters.extractFilename(contentDisposition);
      return { blob: response.data, filename };
    }
  });

const usePublicDownloadReceipt = ({ brokerId }: Pick<ReceiptDetailArgs, 'brokerId'>) =>
  useMutation({
    mutationKey: ['publicDownloadReceipt', brokerId],
    mutationFn: async ({
      organizationId,
      receiptId,
      fiscalCode
    }: Pick<ReceiptDetailArgs, 'organizationId' | 'receiptId' | 'fiscalCode'>) => {
      const response = await utils.apiClient.public.getPublicReceiptPdf(
        brokerId,
        organizationId,
        receiptId,
        { format: 'blob', headers: { 'X-fiscal-code': fiscalCode } }
      );
      const contentDisposition = response.headers['content-disposition'] || '';
      const filename = utils.converters.extractFilename(contentDisposition);
      return { blob: response.data, filename };
    }
  });

const useBrokerInfo = (brokerId: number) =>
  useQuery({
    queryKey: ['brokerInfo', brokerId],
    queryFn: async () => {
      const { data } = await utils.apiClient.public.getPublicBrokerInfo(brokerId);
      return data;
    },
    enabled: brokerId >= 0,
    throwOnError: true,
    gcTime: Infinity
  });

const usePagedUnpaidDebtPositions = (brokerId: number) =>
  useMutation({
    mutationKey: ['pagedUnpaidDebtPositions', brokerId],
    mutationFn: async (args: FilteredRequest) => {
      const query = {
        sort: args.sort,
        ...args.pagination,
        ...args.filters
      };
      const { data } = await utils.apiClient.brokers.getPagedUnpaidDebtPositions(brokerId, query);
      return data;
    }
  });

type InstallmentsByIuvOrNavArgs = {
  iuvOrNav: string;
  fiscalCode: string;
  statuses?: InstallmentStatus[];
};

export enum InstallmentType {
  RECEIPTS = 'receipts',
  ALL = 'all'
}

const usePublicInstallmentsByIuvOrNav = (brokerId: number) =>
  useMutation({
    mutationKey: ['publicInstallmentsByIuvOrNav', brokerId],
    mutationFn: async (args: InstallmentsByIuvOrNavArgs) => {
      const { data } = await utils.apiClient.public.getPublicInstallmentsByIuvOrNav(
        brokerId,
        { iuvOrNav: args.iuvOrNav, statuses: args.statuses },
        { headers: { 'X-fiscal-code': args.fiscalCode } }
      );
      return data;
    }
  });

const getDebtPositionDetail = (brokerId: number, debtPositionId: number, organizationId: number) =>
  useQuery({
    queryKey: ['getDebtPositionDetail', brokerId, debtPositionId],
    queryFn: async () => {
      const { data } = await utils.apiClient.brokers.getDebtorUnpaidDebtPositionOverview(
        brokerId,
        debtPositionId,
        { organizationId }
      );
      return data;
    }
  });

const getDebtorReceipts = (
  brokerId: number,
  organizationId: number,
  debtPositionId: number,
  paymentOptionId: number
) =>
  useQuery({
    queryKey: ['getDebtorReceipts', brokerId, organizationId, debtPositionId, paymentOptionId],
    queryFn: async () => {
      const { data } = await utils.apiClient.brokers.getDebtorReceipts(
        brokerId,
        organizationId,
        debtPositionId,
        paymentOptionId
      );
      return data;
    }
  });

const getMostUsedSpontaneousDebtPositionTypeOrgsForCurrentYear = (
  brokerId: number,
  organizationId: number
) =>
  useQuery({
    queryKey: [
      'getMostUsedSpontaneousDebtPositionTypeOrgsForCurrentYear',
      brokerId,
      organizationId
    ],
    queryFn: async () => {
      const { data } =
        await utils.apiClient.brokers.getMostUsedSpontaneousDebtPositionTypeOrgsForCurrentYear(
          brokerId,
          organizationId
        );
      return data;
    }
  });

const getPublicMostUsedSpontaneousDebtPositionTypeOrgsForCurrentYear = (
  brokerId: number,
  organizationId: number
) =>
  useQuery({
    queryKey: [
      'getPublicMostUsedSpontaneousDebtPositionTypeOrgsForCurrentYear',
      brokerId,
      organizationId
    ],
    queryFn: async () => {
      const { data } =
        await utils.apiClient.public.getPublicMostUsedSpontaneousDebtPositionTypeOrgsForCurrentYear(
          brokerId,
          organizationId
        );
      return data;
    }
  });

export default {
  createSpontaneousDebtPosition,
  getDebtPositionTypeOrgsWithSpontaneous,
  getDebtPositionTypeOrgsWithSpontaneousDetail,
  getOrganizationsWithSpontaneous,
  getPagedDebtorReceipts,
  getPaymentNotice,
  getTokenOneidentity,
  getUserInfo,
  getUserInfoOnce,
  useDownloadReceipt,
  usePagedUnpaidDebtPositions,
  useReceiptDetail,
  getDebtPositionDetail,
  getDebtorReceipts,
  getMostUsedSpontaneousDebtPositionTypeOrgsForCurrentYear,
  public: {
    createPublicSpontaneousDebtPosition,
    getPublicDebtPositionTypeOrgsWithSpontaneous,
    getPublicDebtPositionTypeOrgsWithSpontaneousDetail,
    getPublicOrganizationsWithSpontaneous,
    getPublicPaymentNotice,
    useBrokerInfo,
    usePublicInstallmentsByIuvOrNav,
    usePublicDownloadReceipt,
    usePublicReceiptDetail,
    getPublicMostUsedSpontaneousDebtPositionTypeOrgsForCurrentYear
  }
};
