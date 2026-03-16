import config from 'utils/config';

const rootPrefix = `${config.deployPath}/${config.brokerCode}`;

export const ExternalRoutes = {
  PAYMENT_LINKS: `https://www.pagopa.gov.it/it/cittadini/dove-pagare/`
};

export const ROUTES = {
  LOGIN: `${rootPrefix}/accesso`,
  AUTH_CALLBACK: `${config.deployPath}/auth-callback`,
  DASHBOARD: rootPrefix,
  RECEIPT: `${rootPrefix}/ricevute/:receiptId/:organizationId`,
  DEBT_POSITION_DOWNLOAD: `${rootPrefix}/posizioni-debitorie/download/:nav/:organizationId`,
  RECEIPTS: `${rootPrefix}/ricevute`,
  DEBT_POSITION: `${rootPrefix}/posizioni-debitorie/:debtPositionId/:organizationId`,
  DEBT_POSITIONS: `${rootPrefix}/posizioni-debitorie`,
  USER: `${rootPrefix}/profilo`,
  COURTESY_PAGE: `${rootPrefix}/esito/:outcome`,
  ASSISTANCE: `${rootPrefix}/assistenza`,
  TOS: `${rootPrefix}/termini-di-servizio`,
  PRIVACY_POLICY: `${rootPrefix}/informativa-privacy`,
  PAYMENTS_ON_THE_FLY: `${rootPrefix}/spontanei`,
  PAYMENTS_ON_THE_FLY_DOWNLOAD: `${rootPrefix}/spontanei/download/:orgId/:nav`,
  public: {
    PAYMENTS_ON_THE_FLY: `${rootPrefix}/public/spontanei`,
    PAYMENTS_ON_THE_FLY_DOWNLOAD: `${rootPrefix}/public/spontanei/download/:orgId/:nav`,
    COURTESY_PAGE: `${rootPrefix}/public/esito/:outcome`,
    RECEIPTS_SEARCH: `${rootPrefix}/public/ricevute/ricerca`,
    RECEIPT: `${rootPrefix}/public/ricevute/:receiptId/:organizationId`,
    DEBT_POSITION_DOWNLOAD: `${rootPrefix}/public/posizioni-debitorie/download/:nav/:organizationId`,
    DEBT_POSITION_SEARCH: `${rootPrefix}/public/posizioni-debitorie/ricerca`
  }
};

export enum OUTCOMES {
  /** generic error */
  'sconosciuto' = 400,
  'sessione-scaduta' = 401,
  /** whitelist: user not authorized to access the resource */
  'accesso-non-autorizzato' = 403,
  /** resource not found */
  'risorsa-non-trovata' = 404,
  /** something went wrong with the login */
  'accesso-non-riuscito' = 408,
  'broker-non-trovato' = 410,
  'pagamento-avviso-completato' = 420,
  'avviso-non-pagabile' = 422,
  'avvio-pagamento' = 423,
  'pagamento-non-riuscito' = 424,
  'pagamento-annullato' = 425,
  'errore-server' = 500
}
