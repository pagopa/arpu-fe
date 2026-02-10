import config from 'utils/config';

export const rootPrefix = `${config.deployPath}/${config.brokerId}`;

export const ExternalRoutes = {
  PAYMENT_LINKS: 'https://www.pagopa.gov.it/it/cittadini/dove-pagare/'
};

export const ArcRoutes = {
  LOGIN: '/accesso',
  AUTH_CALLBACK: `${config.deployPath}/auth-callback`,
  DASHBOARD: rootPrefix,
  RECEIPT: `${rootPrefix}/ricevute/:receiptId/:organizationId`,
  DEBT_POSITION_DOWNLOAD: `${rootPrefix}/posizioni-debitorie/download/:iuv/:organizationId`,
  RECEIPTS: `${rootPrefix}/ricevute`,
  DEBT_POSITION: `${rootPrefix}/posizioni-debitorie/:debtPositionId/:organizationId`,
  DEBT_POSITIONS: `${rootPrefix}/posizioni-debitorie`,
  USER: `${rootPrefix}/profilo`,
  COURTESY_PAGE: `${rootPrefix}/errore/:error`,
  ASSISTANCE: `${rootPrefix}/assistenza`,
  TOS: `${rootPrefix}/termini-di-servizio`,
  PRIVACY_POLICY: `${rootPrefix}/informativa-privacy`,
  PAYMENTS_ON_THE_FLY: `${rootPrefix}/spontanei`,
  PAYMENTS_ON_THE_FLY_DOWNLOAD: `${rootPrefix}/spontanei/download/:orgId/:iuv`,
  public: {
    PAYMENTS_ON_THE_FLY: `${rootPrefix}/public/spontanei`,
    PAYMENTS_ON_THE_FLY_DOWNLOAD: `${rootPrefix}/public/spontanei/download/:orgId/:iuv`,
    RECEIPTS_SEARCH: `${rootPrefix}/public/ricevute/ricerca`,
    RECEIPT: `${rootPrefix}/public/ricevute/:receiptId/:organizationId`,
    DEBT_POSITION_DOWNLOAD: `${rootPrefix}/public/posizioni-debitorie/download/:iuv/:organizationId`,
    DEBT_POSITION_SEARCH: `${rootPrefix}/public/posizioni-debitorie/ricerca`
  }
};

export enum ArcErrors {
  /** generic error */
  'sconosciuto' = 400,
  'sessione-scaduta' = 401,
  /** whitelist: user not authorized to access the resource */
  'accesso-non-autorizzato' = 403,
  /** resource not found */
  'risorsa-non-trovata' = 404,
  /** something went wrong with the login */
  'accesso-non-riuscito' = 408,
  'avviso-non-pagabile' = 422,
  'avvio-pagamento' = 423,
  'errore-server' = 500
}
