import { useQuery, QueryKey, useMutation } from '@tanstack/react-query';
import { STATE } from 'store/types';
import utils from 'utils';
import { ZodSchema } from 'zod';
import * as zodSchema from '../../generated/zod-schema';
import { Params } from 'react-router-dom';
import converters from './converters';
import { DebtPositionRequestDTO } from '../../generated/arpu-be/data-contracts';
import { FilteredRequest } from 'models/Filters';

const parseAndLog = <T>(schema: ZodSchema, data: T, throwError: boolean = true): void | never => {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(result.error.issues);
    if (throwError) throw result.error;
  }
};

interface GetNoticesListQuery {
  /** max number of elements returned, default 10*/
  size: number;
  paidByMe?: boolean;
  registeredToMe?: boolean;
  ordering: 'ASC' | 'DESC';
}
/**
 * Retrieve the paged notices list from arc
 */
const getNoticesList = (
  query: GetNoticesListQuery,
  continuationToken: string,
  queryKey?: QueryKey
) =>
  useQuery({
    queryKey: queryKey || ['noticesList'],
    queryFn: async () => {
      const { data: noticesList, headers } = await utils.apiClient.notices.getNoticesList(
        {
          size: query.size,
          paidByMe: query.paidByMe,
          registeredToMe: query.registeredToMe,
          orderBy: 'TRANSACTION_DATE',
          ordering: query.ordering
        },
        {
          headers: {
            'x-continuation-token': continuationToken
          }
        }
      );
      parseAndLog(zodSchema.noticesListDTOSchema, noticesList);
      return {
        notices: noticesList.notices,
        continuationToken: headers['x-continuation-token']
      };
    }
  });

const getPagedDebtorReceipts = (brokerId: number) =>
  useMutation({
    mutationKey: ['pagedDebtorReceipts'],
    mutationFn: async (args: FilteredRequest) => {
      const query = {
        sort: args.sort,
        ...args.pagination,
        ...args.filters
      };
      const { data } = await utils.arpuBeApiClient.brokers.getPagedDebtorReceipts(brokerId, query);
      return data;
    }
  });

const getNoticeDetails = (id: string) =>
  useQuery({
    queryKey: ['noticeDetails'],
    queryFn: async () => {
      const { data: notice } = await utils.apiClient.notices.getNoticeDetails(id);
      parseAndLog(zodSchema.noticeDetailsDTOSchema, notice);
      return notice;
    }
  });

const getPaymentNotices = () =>
  useQuery({
    queryKey: ['paymentNotices'],
    queryFn: async () => {
      const { data } = await utils.apiClient.paymentNotices.getPaymentNotices({});
      parseAndLog(zodSchema.paymentNoticesListDTOSchema, data);
      return data;
    }
  });

const getPaymentNoticeDetails = ({ params: { id, paTaxCode } }: { params: Params }) => {
  if (!id || !paTaxCode) throw new Error('id and paTaxCode are required');

  return () =>
    useQuery({
      queryKey: ['paymentNoticeDetails'],
      queryFn: async () => {
        const { data } = await utils.apiClient.paymentNotices.getPaymentNoticesDetails(id, {
          paTaxCode
        });
        parseAndLog(zodSchema.paymentNoticesListDTOSchema, data);
        return converters.normalizePaymentNoticeDetails(data);
      }
    });
};

const getUserInfo = () => {
  return useQuery({
    queryKey: ['userInfo'],
    queryFn: async () => {
      const { data: userInfo } = await utils.apiClient.auth.getUserInfo();
      parseAndLog(zodSchema.userInfoSchema, userInfo);
      return userInfo;
    }
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

export const getOrganizations = () =>
  useQuery({
    queryKey: ['getOrganizations'],
    queryFn: async () => {
      const { data: organizations } = await utils.apiClient.organizations.getOrganizations();
      return organizations;
    }
  });

export const createSpontaneousDebtPosition = (brokerId: number, body: DebtPositionRequestDTO) =>
  useQuery({
    queryKey: ['createSpontaneousDebtPosition'],
    queryFn: async () => {
      const { data } = await utils.arpuBeApiClient.brokers.createSpontaneousDebtPosition(
        brokerId,
        body
      );
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
      const { data } = await utils.arpuBeApiClient.public.createPublicSpontaneousDebtPosition(
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
      const { data } =
        await utils.arpuBeApiClient.brokers.getOrganizationsWithSpontaneous(brokerId);
      return data;
    }
  });

export const getPublicOrganizationsWithSpontaneous = (brokerId: number) =>
  useQuery({
    queryKey: ['getPublicOrganizationsWithSpontaneous'],
    queryFn: async () => {
      const { data } =
        await utils.arpuBeApiClient.public.getPublicOrganizationsWithSpontaneous(brokerId);
      return data;
    }
  });

export const getDebtPositionTypeOrgsWithSpontaneous = (brokerId: number, organizationId: number) =>
  useQuery({
    queryKey: ['getDebtPositionTypeOrgsWithSpontaneous'],
    queryFn: async () => {
      const { data } = await utils.arpuBeApiClient.brokers.getDebtPositionTypeOrgsWithSpontaneous(
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
      const { data } =
        await utils.arpuBeApiClient.public.getPublicDebtPositionTypeOrgsWithSpontaneous(
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
      const { data } =
        await utils.arpuBeApiClient.brokers.getDebtPositionTypeOrgsWithSpontaneousDetail(
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
        await utils.arpuBeApiClient.public.getPublicDebtPositionTypeOrgsWithSpontaneousDetail(
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
  query: GetPaymentNoticeQueryParam
) =>
  useMutation({
    mutationKey: ['getPaymentNotice'],
    mutationFn: async () => {
      const response = await utils.arpuBeApiClient.brokers.getPaymentNotice(
        brokerId,
        organizationId,
        query,
        { format: 'blob' }
      );

      const contentDisposition = response.headers['content-disposition'] || '';
      const filename = utils.converters.extractFilename(contentDisposition);
      return { data: response.data, filename };
    }
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
      const response = await utils.arpuBeApiClient.public.getPublicPaymentNotice(
        brokerId,
        organizationId,
        query,
        { format: 'blob', headers: { 'X-fiscal-code': debtorFiscalCode } }
      );

      const contentDisposition = response.headers['content-disposition'] || '';
      const filename = utils.converters.extractFilename(contentDisposition);
      return { data: response.data, filename };
    }
  });

type ReceiptDetailArgs = {
  brokerId: number;
  organizationId: number;
  receiptId: number;
};

const useReceiptDetail = ({ brokerId, organizationId, receiptId }: ReceiptDetailArgs) =>
  useQuery({
    queryKey: ['receiptDetail', brokerId, organizationId, receiptId],
    queryFn: async () => {
      const { data } = await utils.arpuBeApiClient.brokers.getReceiptDetail(
        brokerId,
        organizationId,
        receiptId
      );
      return data;
    }
  });

const useDownloadReceipt = ({ brokerId, organizationId, receiptId }: ReceiptDetailArgs) =>
  useMutation({
    mutationKey: ['downloadReceipt', brokerId, organizationId, receiptId],
    mutationFn: async () => {
      const response = await utils.arpuBeApiClient.brokers.getReceiptPdf(
        brokerId,
        organizationId,
        receiptId,
        { format: 'blob' }
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
      const { data } = await utils.arpuBeApiClient.public.getPublicBrokerInfo(brokerId);
      return data;
    },
    gcTime: Infinity
  });

export default {
  getPaymentNotices,
  getPaymentNoticeDetails,
  getTokenOneidentity,
  getNoticeDetails,
  getNoticesList,
  getPagedDebtorReceipts,
  getUserInfo,
  getUserInfoOnce,
  getOrganizations,
  createSpontaneousDebtPosition,
  getOrganizationsWithSpontaneous,
  getDebtPositionTypeOrgsWithSpontaneous,
  getDebtPositionTypeOrgsWithSpontaneousDetail,
  getPaymentNotice,
  useDownloadReceipt,
  useReceiptDetail,
  public: {
    getPublicOrganizationsWithSpontaneous,
    getPublicDebtPositionTypeOrgsWithSpontaneous,
    getPublicDebtPositionTypeOrgsWithSpontaneousDetail,
    createPublicSpontaneousDebtPosition,
    getPublicPaymentNotice,
    useBrokerInfo
  }
};
